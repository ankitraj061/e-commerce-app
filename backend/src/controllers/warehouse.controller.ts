
import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { getParam } from "../utils/getParam.js";

export const warehouseController = {
  async getAll(_req: Request, res: Response): Promise<void> {
    const warehouses = await prisma.warehouse.findMany({
      orderBy: { name: "asc" },
    });
    sendSuccess(res, { warehouses });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const warehouse = await prisma.warehouse.findUnique({
      where: { id: getParam(req.params.id) },
      include: {
        inventories: {
          include: { product: true },
        },
      },
    });

    if (!warehouse) {
      res.status(404).json({ success: false, error: "Warehouse not found." });
      return;
    }

    sendSuccess(res, { warehouse });
  },
};
