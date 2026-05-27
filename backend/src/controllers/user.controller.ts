
import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";

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
  

  async getProfile(req: Request, res: Response): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: USER_SAFE_SELECT,
    });
    if (!user) throw new ApiError(404, "User not found.");
    sendSuccess(res, { user });
  },

  

  async updateProfile(req: Request, res: Response): Promise<void> {
    const { name } = req.body as { name?: string };

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { ...(name && { name }) },
      select: USER_SAFE_SELECT,
    });

    sendSuccess(res, { user }, "Profile updated.");
  },

  
  

  async selectWarehouse(req: Request, res: Response): Promise<void> {
    const { warehouseId } = req.body as { warehouseId: string };

    
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

  

  async clearWarehouse(req: Request, res: Response): Promise<void> {
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { selectedWarehouseId: null },
      select: USER_SAFE_SELECT,
    });
    sendSuccess(res, { user }, "Warehouse selection cleared.");
  },
};
