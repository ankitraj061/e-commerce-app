
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

    async cancelOrder(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      
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
