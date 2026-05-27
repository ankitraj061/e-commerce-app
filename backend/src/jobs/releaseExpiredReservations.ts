/**
 * releaseExpiredReservations.ts
 *
 * ─── WHAT THIS JOB DOES ──────────────────────────────────────────────────────
 * Runs on a configurable interval (default: every 60 seconds) and finds all
 * PENDING reservations whose `expiresAt` has passed, then atomically:
 *   1. Transitions their status from PENDING → EXPIRED
 *   2. Returns their reserved stock to the available pool
 *   3. Marks any associated PENDING payment as FAILED
 *
 * ─── CONCURRENCY SAFETY ──────────────────────────────────────────────────────
 * The status update uses `updateMany` with a compound WHERE:
 *   WHERE id = X AND status = 'PENDING' AND expiresAt < now
 *
 * This is an atomic test-and-set: if a confirm request arrived at the exact
 * same moment and set status = CONFIRMED, `updateMany` returns count=0 and
 * we skip the stock release for that reservation. No race condition possible.
 *
 * ─── PRODUCTION CONSIDERATION ────────────────────────────────────────────────
 * In production with multiple server instances, use a distributed job queue
 * (BullMQ + Redis) or a PostgreSQL-backed cron (pg_cron) to ensure only one
 * instance processes a batch. For now, setInterval is appropriate for a
 * single-instance deployment or development.
 */

import { prisma } from "../lib/prisma.js";

const JOB_INTERVAL_MS = 60_000; // Run every 60 seconds
const BATCH_SIZE = 50; // Process up to 50 per run to avoid long transactions

async function releaseExpiredReservations(): Promise<void> {
  const now = new Date();

  // Find candidates (read-only query, no lock needed here)
  const expired = await prisma.reservation.findMany({
    where: {
      status: "PENDING",
      expiresAt: { lt: now },
    },
    select: {
      id: true,
      productId: true,
      warehouseId: true,
      quantity: true,
    },
    take: BATCH_SIZE,
  });

  if (expired.length === 0) return;

  console.log(
    `[expiry-job] Found ${expired.length} expired reservation(s). Processing...`
  );

  let released = 0;
  let skipped = 0;

  for (const reservation of expired) {
    try {
      await prisma.$transaction(async (tx) => {
        // ── Atomic test-and-set ───────────────────────────────────────────────
        // Only proceed if STILL PENDING (guards against concurrent confirmation)
        const updated = await tx.reservation.updateMany({
          where: {
            id: reservation.id,
            status: "PENDING",          // concurrent confirmation would have changed this
            expiresAt: { lt: now },
          },
          data: { status: "EXPIRED" },
        });

        // Another process already handled this reservation (e.g. confirmed)
        if (updated.count === 0) {
          skipped++;
          return;
        }

        // ── Release stock back to the available pool ───────────────────────────
        // We only decrement reservedStock; totalStock stays the same.
        // available = totalStock - reservedStock → available increases.
        await tx.inventory.update({
          where: {
            productId_warehouseId: {
              productId: reservation.productId,
              warehouseId: reservation.warehouseId,
            },
          },
          data: {
            reservedStock: { decrement: reservation.quantity },
          },
        });

        // ── Mark associated payment as FAILED ──────────────────────────────────
        await tx.payment.updateMany({
          where: {
            reservationId: reservation.id,
            status: "PENDING",
          },
          data: { status: "FAILED" },
        });

        released++;
      });
    } catch (err) {
      // Log and continue — a single failed release should not stop the batch
      console.error(
        `[expiry-job] Failed to release reservation ${reservation.id}:`,
        err
      );
    }
  }

  console.log(
    `[expiry-job] Done. Released: ${released}, Skipped (already processed): ${skipped}`
  );
}

/**
 * Starts the expiry job on an interval.
 * Call once at application startup.
 */
export function startReservationExpiryJob(): void {
  console.log(
    `[expiry-job] Started. Running every ${JOB_INTERVAL_MS / 1000}s`
  );

  // Run immediately on startup, then on interval
  releaseExpiredReservations().catch((err) =>
    console.error("[expiry-job] Initial run failed:", err)
  );

  setInterval(() => {
    releaseExpiredReservations().catch((err) =>
      console.error("[expiry-job] Interval run failed:", err)
    );
  }, JOB_INTERVAL_MS);
}
