
import { prisma } from "../lib/prisma.js";

const JOB_INTERVAL_MS = 60_000; 
const BATCH_SIZE = 50; 

async function releaseExpiredReservations(): Promise<void> {
  const now = new Date();

  
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
        
        
        const updated = await tx.reservation.updateMany({
          where: {
            id: reservation.id,
            status: "PENDING",          
            expiresAt: { lt: now },
          },
          data: { status: "EXPIRED" },
        });

        
        if (updated.count === 0) {
          skipped++;
          return;
        }

        
        
        
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

export function startReservationExpiryJob(): void {
  console.log(
    `[expiry-job] Started. Running every ${JOB_INTERVAL_MS / 1000}s`
  );

  
  releaseExpiredReservations().catch((err) =>
    console.error("[expiry-job] Initial run failed:", err)
  );

  setInterval(() => {
    releaseExpiredReservations().catch((err) =>
      console.error("[expiry-job] Interval run failed:", err)
    );
  }, JOB_INTERVAL_MS);
}
