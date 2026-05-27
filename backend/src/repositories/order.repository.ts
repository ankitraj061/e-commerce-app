/**
 * order.repository.ts
 * Read operations for Orders.
 * Order creation happens inside the confirm-reservation transaction.
 */

import { prisma } from "../lib/prisma.js";

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
};
