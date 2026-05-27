
import { prisma } from "../lib/prisma.js";
import type { Payment } from "@prisma/client";

export const paymentRepository = {
  

  async create(data: {
    reservationId: string;
    razorpayOrderId: string;
    amount: number;
  }): Promise<Payment> {
    return prisma.payment.create({
      data: {
        reservationId: data.reservationId,
        razorpayOrderId: data.razorpayOrderId,
        amount: data.amount,
        status: "PENDING",
      },
    });
  },

  

  async findByReservationId(reservationId: string): Promise<Payment | null> {
    return prisma.payment.findUnique({ where: { reservationId } });
  },

  async findByRazorpayOrderId(razorpayOrderId: string): Promise<Payment | null> {
    return prisma.payment.findUnique({ where: { razorpayOrderId } });
  },
};
