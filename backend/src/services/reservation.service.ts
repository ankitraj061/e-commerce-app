
import { prisma } from "../lib/prisma.js";
import type { Prisma } from "@prisma/client";
import { ApiError } from "../utils/apiError.js";
import type { CreateReservationInput } from "../validations/reservation.validation.js";

const RESERVATION_EXPIRY_MINUTES = 10;
const TRANSACTION_TIMEOUT_MS = 15_000; 

interface InventoryRow {
  id: string;
  totalStock: number;
  reservedStock: number;
}

export const reservationService = {
  

  async createReservation(
    userId: string,
    warehouseId: string,
    input: CreateReservationInput
  ) {
    const { productId, quantity, deliveryAddressId } = input;

    
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) throw new ApiError(404, "Product not found.");

    
    const address = await prisma.address.findFirst({
      where: { id: deliveryAddressId, userId },
    });
    if (!address) throw new ApiError(404, "Delivery address not found.");

    
    const reservation = await prisma.$transaction(
      async (tx) => {
        
        
        
        
        
        
        
        const rows = await tx.$queryRaw<InventoryRow[]>`
          SELECT id, "totalStock", "reservedStock"
          FROM "Inventory"
          WHERE "productId" = ${productId}
          AND   "warehouseId" = ${warehouseId}
          FOR UPDATE
        `;

        if (rows.length === 0) {
          throw new ApiError(
            404,
            "This product is not stocked at your selected warehouse."
          );
        }

        const inventory = rows[0];

        
        
        
        
        const available = inventory.totalStock - inventory.reservedStock;

        if (available < quantity) {
          throw new ApiError(
            409,
            `Insufficient stock. Requested: ${quantity}, Available: ${available}.`
          );
        }

        
        
        
        await tx.inventory.update({
          where: {
            productId_warehouseId: { productId, warehouseId },
          },
          data: {
            reservedStock: { increment: quantity },
          },
        });

        
        const expiresAt = new Date(
          Date.now() + RESERVATION_EXPIRY_MINUTES * 60 * 1000
        );

        const newReservation = await tx.reservation.create({
          data: {
            userId,
            productId,
            warehouseId,
            deliveryAddressId: deliveryAddressId,
            quantity,
            status: "PENDING",
            paymentStatus: "PENDING",
            expiresAt,
          },
          include: {
            product: true,
            warehouse: true,
            deliveryAddress: true,
          },
        });

        return newReservation;
        
      },
      { timeout: TRANSACTION_TIMEOUT_MS }
    );

    return reservation;
  },

  

  async releaseReservation(reservationId: string, userId: string) {
    await prisma.$transaction(async (tx) => {
      const reservation = await tx.reservation.findUnique({
        where: { id: reservationId },
      });

      if (!reservation) throw new ApiError(404, "Reservation not found.");
      if (reservation.userId !== userId)
        throw new ApiError(403, "Not authorised to release this reservation.");

      
      
      const updated = await tx.reservation.updateMany({
        where: { id: reservationId, status: "PENDING" },
        data: { status: "RELEASED" },
      });

      if (updated.count === 0) {
        throw new ApiError(
          409,
          "Reservation is no longer pending and cannot be released."
        );
      }

      
      
      
      await tx.$executeRaw`
        UPDATE "Inventory"
        SET
          "reservedStock" = GREATEST(0, "reservedStock" - ${reservation.quantity}),
          "updatedAt"     = NOW()
        WHERE "productId"   = ${reservation.productId}
          AND "warehouseId" = ${reservation.warehouseId}
      `;

      // Mark payment as FAILED if one exists
      await tx.payment.updateMany({
        where: { reservationId, status: "PENDING" },
        data: { status: "FAILED" },
      });
    });
  },

  // ─── Confirm reservation (called after payment verification) ───────────────

  async confirmReservation(
    reservationId: string,
    userId: string,
    paymentDetails: {
      razorpayOrderId: string;   // now required — verified against DB record
      razorpayPaymentId: string;
      razorpaySignature: string;
    }
  ) {
    const order = await prisma.$transaction(async (tx) => {
      // Fetch reservation inside transaction for consistent read
      const reservation = await tx.reservation.findUnique({
        where: { id: reservationId },
        include: { product: true },
      });

      if (!reservation) throw new ApiError(404, "Reservation not found.");
      if (reservation.userId !== userId)
        throw new ApiError(403, "Not authorised.");

      // ── Guard: expired ────────────────────────────────────────────────────
      if (reservation.expiresAt < new Date()) {
        throw new ApiError(
          410,
          "Reservation has expired. Please create a new reservation."
        );
      }

      // ── Guard: already processed ──────────────────────────────────────────
      if (reservation.status !== "PENDING") {
        throw new ApiError(
          409,
          `Reservation is already ${reservation.status.toLowerCase()}.`
        );
      }

      // ── Fetch the associated payment ──────────────────────────────────────
      const payment = await tx.payment.findUnique({ where: { reservationId } });
      if (!payment) throw new ApiError(404, "Payment record not found. Call create-order first.");
      if (payment.status === "PAID")
        throw new ApiError(409, "Payment already processed.");

      // ── BUG FIX: Verify razorpayOrderId belongs to THIS reservation ───────
      // Without this check a client could replay a valid signature from a
      // different order to confirm an unrelated reservation.
      if (payment.razorpayOrderId !== paymentDetails.razorpayOrderId) {
        throw new ApiError(
          400,
          "razorpayOrderId does not match the payment record for this reservation."
        );
      }

      // ── Update payment record ─────────────────────────────────────────────
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "PAID",
          razorpayPaymentId: paymentDetails.razorpayPaymentId,
          razorpaySignature: paymentDetails.razorpaySignature,
        },
      });

      // ── Settle stock: totalStock -= qty, reservedStock -= qty ─────────────
      // available = totalStock - reservedStock remains unchanged.
      // BUG FIX: Use GREATEST(0, ...) via raw SQL to guarantee no negative stock
      // even if a concurrent expiry job already decremented reservedStock.
      await tx.$executeRaw`
        UPDATE "Inventory"
        SET
          "totalStock"    = GREATEST(0, "totalStock"    - ${reservation.quantity}),
          "reservedStock" = GREATEST(0, "reservedStock" - ${reservation.quantity}),
          "updatedAt"     = NOW()
        WHERE "productId"   = ${reservation.productId}
          AND "warehouseId" = ${reservation.warehouseId}
      `;

      
      
      
      
      const statusUpdate = await tx.reservation.updateMany({
        where: { id: reservationId, status: "PENDING" },
        data: { status: "CONFIRMED", paymentStatus: "PAID" },
      });

      if (statusUpdate.count === 0) {
        throw new ApiError(
          410,
          "Reservation expired while processing payment. Stock has been released."
        );
      }

      
      const totalAmount =
        Number(reservation.product.price) * reservation.quantity;

      const newOrder = await tx.order.create({
        data: {
          userId,
          reservationId,
          addressId: reservation.deliveryAddressId,
          totalAmount,
          status: "PLACED",
          items: {
            create: {
              productId: reservation.productId,
              quantity: reservation.quantity,
              price: reservation.product.price,
            },
          },
        },
        include: {
          items: { include: { product: true } },
          address: true,
        },
      });

      return newOrder;
    });

    return order;
  },
};
