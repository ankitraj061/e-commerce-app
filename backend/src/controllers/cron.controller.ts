/**
 * cron.controller.ts
 *
 * HTTP handler for scheduled jobs triggered by Google Cloud Scheduler.
 *
 * ── Security ──────────────────────────────────────────────────────────────────
 * Cloud Scheduler is configured to send a shared secret in the
 * `X-Cron-Secret` header. This endpoint validates that header so random
 * internet traffic cannot trigger expensive database operations.
 *
 * Set the CRON_SECRET env var to a random 32+ character string and
 * configure Cloud Scheduler to include the same value as a header:
 *   Header name : X-Cron-Secret
 *   Header value: <your CRON_SECRET>
 *
 * ── Why this exists ───────────────────────────────────────────────────────────
 * Cloud Run scales to zero when idle, which kills any in-process setInterval.
 * Cloud Scheduler hits this endpoint every minute, which:
 *   1. Keeps the container warm (prevents cold starts for real users)
 *   2. Reliably triggers the reservation expiry logic on schedule
 */

import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

const BATCH_SIZE = 50;

export const cronController = {
  async releaseExpiredReservations(req: Request, res: Response): Promise<void> {
    // ── Auth: validate the shared secret sent by Cloud Scheduler ──────────────
    const secret = req.headers["x-cron-secret"];
    if (!secret || secret !== process.env.CRON_SECRET) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const now = new Date();

    const expired = await prisma.reservation.findMany({
      where: { status: "PENDING", expiresAt: { lt: now } },
      select: { id: true, productId: true, warehouseId: true, quantity: true },
      take: BATCH_SIZE,
    });

    if (expired.length === 0) {
      res.json({ success: true, data: { released: 0, skipped: 0 } });
      return;
    }

    let released = 0;
    let skipped = 0;

    for (const reservation of expired) {
      try {
        await prisma.$transaction(async (tx) => {
          const updated = await tx.reservation.updateMany({
            where: { id: reservation.id, status: "PENDING", expiresAt: { lt: now } },
            data: { status: "EXPIRED" },
          });

          if (updated.count === 0) { skipped++; return; }

          await tx.inventory.update({
            where: {
              productId_warehouseId: {
                productId: reservation.productId,
                warehouseId: reservation.warehouseId,
              },
            },
            data: { reservedStock: { decrement: reservation.quantity } },
          });

          await tx.payment.updateMany({
            where: { reservationId: reservation.id, status: "PENDING" },
            data: { status: "FAILED" },
          });

          released++;
        });
      } catch (err) {
        console.error(`[cron] Failed to release reservation ${reservation.id}:`, err);
      }
    }

    console.log(`[cron] release-reservations: released=${released} skipped=${skipped}`);
    res.json({ success: true, data: { released, skipped } });
  },
};
