
import { prisma } from "../lib/prisma.js";
import type { Reservation, ReservationStatus } from "@prisma/client";

export const reservationRepository = {
  

  async findById(id: string): Promise<Reservation | null> {
    return prisma.reservation.findUnique({ where: { id } });
  },

  async findByIdWithDetails(id: string) {
    return prisma.reservation.findUnique({
      where: { id },
      include: {
        product: true,
        warehouse: true,
        deliveryAddress: true,
        payment: true,
        order: true,
      },
    });
  },

  async findByUserId(userId: string) {
    return prisma.reservation.findMany({
      where: { userId },
      include: { product: true, warehouse: true, payment: true },
      orderBy: { createdAt: "desc" },
    });
  },

    async findExpired(): Promise<Reservation[]> {
    return prisma.reservation.findMany({
      where: {
        status: "PENDING",
        expiresAt: { lt: new Date() },
      },
    });
  },
};
