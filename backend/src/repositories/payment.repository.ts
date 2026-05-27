/**
 * payment.repository.ts
 * Database operations for the Payment model.
 */

import { prisma } from "../lib/prisma.js";
import type { Payment } from "@prisma/client";

export const paymentRepository = {
  // ── Create ──────────────────────────────────────────────────────────────────

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

  // ── Read ────────────────────────────────────────────────────────────────────

  async findByReservationId(reservationId: string): Promise<Payment | null> {
    return prisma.payment.findUnique({ where: { reservationId } });
  },

  async findByRazorpayOrderId(razorpayOrderId: string): Promise<Payment | null> {
    return prisma.payment.findUnique({ where: { razorpayOrderId } });
  },
};
