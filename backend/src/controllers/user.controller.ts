/**
 * user.controller.ts
 * Handles user profile management routes:
 *
 *   GET   /api/users/me              — full profile (DB read, not JWT payload)
 *   PATCH /api/users/me              — update name
 *   PATCH /api/users/me/warehouse    — set selectedWarehouseId (reservation prerequisite)
 *   DELETE /api/users/me/warehouse   — clear warehouse selection
 */

import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

// Reusable select shape for user profile (never return password)
const USER_SAFE_SELECT = {
  id: true,
  name: true,
  email: true,
  selectedWarehouseId: true,
  selectedWarehouse: {
    select: { id: true, name: true, city: true, state: true },
  },
  createdAt: true,
  updatedAt: true,
} as const;

export const userController = {
  // ─── GET /api/users/me ────────────────────────────────────────────────────

  async getProfile(req: Request, res: Response): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: USER_SAFE_SELECT,
    });
    if (!user) throw new ApiError(404, "User not found.");
    sendSuccess(res, { user });
  },

  // ─── PATCH /api/users/me ──────────────────────────────────────────────────

  async updateProfile(req: Request, res: Response): Promise<void> {
    const { name } = req.body as { name?: string };

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { ...(name && { name }) },
      select: USER_SAFE_SELECT,
    });

    sendSuccess(res, { user }, "Profile updated.");
  },

  // ─── PATCH /api/users/me/warehouse ────────────────────────────────────────
  // The frontend warehouse-selection page calls this before creating a reservation.

  async selectWarehouse(req: Request, res: Response): Promise<void> {
    const { warehouseId } = req.body as { warehouseId: string };

    // Verify the warehouse actually exists
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: warehouseId },
    });
    if (!warehouse) throw new ApiError(404, "Warehouse not found.");

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { selectedWarehouseId: warehouseId },
      select: USER_SAFE_SELECT,
    });

    sendSuccess(res, { user }, `Warehouse set to "${warehouse.name}".`);
  },

  // ─── DELETE /api/users/me/warehouse ──────────────────────────────────────

  async clearWarehouse(req: Request, res: Response): Promise<void> {
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { selectedWarehouseId: null },
      select: USER_SAFE_SELECT,
    });
    sendSuccess(res, { user }, "Warehouse selection cleared.");
  },
};
