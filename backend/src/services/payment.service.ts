/**
 * payment.service.ts
 * Razorpay integration for order creation and payment signature verification.
 *
 * Flow:
 *   1. createRazorpayOrder()     — creates order on Razorpay + persists Payment row
 *   2. verifyPaymentSignature()  — validates HMAC-SHA256 signature from Razorpay webhook
 *   3. reservationService.confirmReservation() — called after successful verification
 *
 * Signature verification formula (from Razorpay docs):
 *   HMAC-SHA256( razorpayOrderId + "|" + razorpayPaymentId, RAZORPAY_KEY_SECRET )
 *   === razorpaySignature
 */

import crypto from "crypto";
import { razorpay } from "../lib/razorpay.js";
import { paymentRepository } from "../repositories/payment.repository.js";
import { reservationRepository } from "../repositories/reservation.repository.js";
import { ApiError } from "../utils/apiError.js";
import { env } from "../config/env.js";

export const paymentService = {
  // ─── Step 1: Create Razorpay order ────────────────────────────────────────

  async createRazorpayOrder(reservationId: string, userId: string) {
    // Verify reservation ownership and state
    const reservation = await reservationRepository.findByIdWithDetails(reservationId);

    if (!reservation) throw new ApiError(404, "Reservation not found.");
    if (reservation.userId !== userId)
      throw new ApiError(403, "Not authorised.");
    if (reservation.status !== "PENDING")
      throw new ApiError(
        409,
        `Cannot create payment for a ${reservation.status.toLowerCase()} reservation.`
      );
    if (reservation.expiresAt < new Date())
      throw new ApiError(410, "Reservation has expired.");

    // Check if payment already exists (idempotent re-fetch)
    const existingPayment = await paymentRepository.findByReservationId(
      reservationId
    );
    if (existingPayment) {
      return {
        razorpayOrderId: existingPayment.razorpayOrderId,
        amount: Number(existingPayment.amount),
        currency: "INR",
        razorpayKeyId: env.RAZORPAY_KEY_ID,
      };
    }

    // Calculate amount in paise (Razorpay requires smallest currency unit)
    const unitPrice = Number(reservation.product.price);
    const totalAmount = unitPrice * reservation.quantity;
    const amountInPaise = Math.round(totalAmount * 100);

    // Create order on Razorpay
    const razorpayOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_${reservationId.slice(0, 20)}`,
      notes: {
        reservationId,
        userId,
        productId: reservation.productId,
      },
    });

    // Persist payment record
    await paymentRepository.create({
      reservationId,
      razorpayOrderId: razorpayOrder.id,
      amount: totalAmount,
    });

    return {
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: "INR",
      razorpayKeyId: env.RAZORPAY_KEY_ID,
    };
  },

  // ─── Step 2: Verify Razorpay payment signature ────────────────────────────

  verifyPaymentSignature(params: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): boolean {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = params;

    // Razorpay signs: HMAC-SHA256(orderId + "|" + paymentId, keySecret)
    const expectedSignature = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    // Constant-time comparison to prevent timing attacks
    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const receivedBuffer = Buffer.from(razorpaySignature, "hex");

    if (expectedBuffer.length !== receivedBuffer.length) return false;

    return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
  },
};
