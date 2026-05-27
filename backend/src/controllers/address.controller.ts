/**
 * address.controller.ts
 *
 * GET    /api/addresses          — list user's addresses
 * POST   /api/addresses          — create new address
 * GET    /api/addresses/:id      — single address
 * PATCH  /api/addresses/:id      — update address fields
 * DELETE /api/addresses/:id      — delete address
 * PATCH  /api/addresses/:id/default — set as default delivery address
 */

import { Request, Response } from "express";
import { addressRepository } from "../repositories/address.repository.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { getParam } from "../utils/getParam.js";

export const addressController = {
  // ─── List ─────────────────────────────────────────────────────────────────

  async list(req: Request, res: Response): Promise<void> {
    const addresses = await addressRepository.findAllByUser(req.user!.userId);
    sendSuccess(res, { addresses });
  },

  // ─── Create ───────────────────────────────────────────────────────────────

  async create(req: Request, res: Response): Promise<void> {
    const address = await addressRepository.create(req.user!.userId, req.body);
    sendSuccess(res, { address }, "Address created.", 201);
  },

  // ─── Get one ──────────────────────────────────────────────────────────────

  async getById(req: Request, res: Response): Promise<void> {
    const address = await addressRepository.findByIdAndUser(
      getParam(req.params.id),
      req.user!.userId
    );
    if (!address) throw new ApiError(404, "Address not found.");
    sendSuccess(res, { address });
  },

  // ─── Update ───────────────────────────────────────────────────────────────

  async update(req: Request, res: Response): Promise<void> {
    const address = await addressRepository.update(
      getParam(req.params.id),
      req.user!.userId,
      req.body
    );
    if (!address) throw new ApiError(404, "Address not found.");
    sendSuccess(res, { address }, "Address updated.");
  },

  // ─── Delete ───────────────────────────────────────────────────────────────

  async remove(req: Request, res: Response): Promise<void> {
    const deleted = await addressRepository.delete(
      getParam(req.params.id),
      req.user!.userId
    );
    if (!deleted) throw new ApiError(404, "Address not found.");
    sendSuccess(res, null, "Address deleted.");
  },

  // ─── Set default ──────────────────────────────────────────────────────────

  async setDefault(req: Request, res: Response): Promise<void> {
    const address = await addressRepository.setDefault(
      getParam(req.params.id),
      req.user!.userId
    );
    if (!address) throw new ApiError(404, "Address not found.");
    sendSuccess(res, { address }, "Default address updated.");
  },
};
