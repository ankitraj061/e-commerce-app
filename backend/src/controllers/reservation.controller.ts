/**
 * reservation.controller.ts
 * HTTP layer for reservation lifecycle:
 *   POST   /api/reservations              — create (concurrency-safe)
 *   GET    /api/reservations              — list user's reservations
 *   GET    /api/reservations/:id          — single reservation detail
 *   POST   /api/reservations/:id/confirm  — confirm after payment
 *   POST   /api/reservations/:id/release  — manually release
 */

import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { reservationService } from "../services/reservation.service.js";
import { paymentService } from "../services/payment.service.js";
import { reservationRepository } from "../repositories/reservation.repository.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { getParam } from "../utils/getParam.js";

export const reservationController = {
  // ─── Create ──────────────────────────────────────────────────────────────

  async create(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;

    // Warehouse comes from the authenticated user's profile
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user?.selectedWarehouseId) {
      throw new ApiError(
        400,
        "No warehouse selected. Please select a warehouse before reserving."
      );
    }

    const reservation = await reservationService.createReservation(
      userId,
      user.selectedWarehouseId,
      req.body
    );

    sendSuccess(res, { reservation }, "Reservation created successfully.", 201);
  },

  // ─── List ─────────────────────────────────────────────────────────────────

  async list(req: Request, res: Response): Promise<void> {
    const reservations = await reservationRepository.findByUserId(
      req.user!.userId
    );
    sendSuccess(res, { reservations });
  },

  // ─── Get by ID ────────────────────────────────────────────────────────────

  async getById(req: Request, res: Response): Promise<void> {
    const reservation = await reservationRepository.findByIdWithDetails(
      getParam(req.params.id)
    );
    if (!reservation) throw new ApiError(404, "Reservation not found.");
    if (reservation.userId !== req.user!.userId)
      throw new ApiError(403, "Not authorised.");

    sendSuccess(res, { reservation });
  },

  // ─── Confirm (after payment) ──────────────────────────────────────────────

  async confirm(req: Request, res: Response): Promise<void> {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    // Verify Razorpay signature BEFORE touching the DB
    const isValid = paymentService.verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });

    if (!isValid) {
      throw new ApiError(400, "Payment signature verification failed.");
    }

    const order = await reservationService.confirmReservation(
      getParam(req.params.id),
      req.user!.userId,
      { razorpayOrderId, razorpayPaymentId, razorpaySignature }
    );

    sendSuccess(res, { order }, "Reservation confirmed. Order placed.", 201);
  },

  // ─── Release ──────────────────────────────────────────────────────────────

  async release(req: Request, res: Response): Promise<void> {
    await reservationService.releaseReservation(
      getParam(req.params.id),
      req.user!.userId
    );
    sendSuccess(res, null, "Reservation released. Stock returned to pool.");
  },
};
