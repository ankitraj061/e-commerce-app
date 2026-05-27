/**
 * order.repository.ts
 * Read + cancel operations for Orders.
 * Order creation happens inside the confirm-reservation transaction.
 */

import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/apiError.js";

export const orderRepository = {
  async findByUserId(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        items: { include: { product: true } },
        address: true,
        reservation: { include: { warehouse: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async findByIdAndUser(id: string, userId: string) {
    return prisma.order.findFirst({
      where: { id, userId },
      include: {
        items: { include: { product: true } },
        address: true,
        reservation: { include: { warehouse: true, payment: true } },
      },
    });
  },

  /**
   * Cancel an order and immediately return stock to the inventory.
   *
   * Stock accounting:
   *   When a reservation is confirmed, the service does:
   *     totalStock -= qty, reservedStock -= qty   (available unchanged)
   *   So on cancellation we restore:
   *     totalStock += qty   (available increases; reservedStock is already settled)
   *
   * Only PLACED or PROCESSING orders may be cancelled.
   * The whole operation runs in a single transaction.
   */
  async cancelOrder(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      // Load order with items + reservation (for warehouseId)
      const order = await tx.order.findFirst({
        where: { id, userId },
        include: {
          items: true,
          reservation: true,
        },
      });

      if (!order) throw new ApiError(404, "Order not found.");

      const cancellableStatuses = ["PLACED", "PROCESSING"];
      if (!cancellableStatuses.includes(order.status)) {
        throw new ApiError(
          409,
          `Cannot cancel an order that is already ${order.status.toLowerCase()}.`
        );
      }

      // Restore totalStock for every item in the order
      const warehouseId = order.reservation?.warehouseId;
      if (warehouseId) {
        for (const item of order.items) {
          await tx.$executeRaw`
            UPDATE "Inventory"
            SET
              "totalStock" = "totalStock" + ${item.quantity},
              "updatedAt"  = NOW()
            WHERE "productId"   = ${item.productId}
              AND "warehouseId" = ${warehouseId}
          `;
        }
      }

      // Mark the order cancelled
      const updated = await tx.order.update({
        where: { id },
        data: { status: "CANCELLED" },
        include: {
          items: { include: { product: true } },
          address: true,
          reservation: { include: { warehouse: true, payment: true } },
        },
      });

      return updated;
    });
  },
};
