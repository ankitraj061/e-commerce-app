/**
 * order.controller.ts
 *
 * GET /api/orders       — list authenticated user's orders (most recent first)
 * GET /api/orders/:id   — single order with full detail (items, address, reservation)
 */

import { Request, Response } from "express";
import { orderRepository } from "../repositories/order.repository.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { getParam } from "../utils/getParam.js";

export const orderController = {
  async list(req: Request, res: Response): Promise<void> {
    const orders = await orderRepository.findByUserId(req.user!.userId);
    sendSuccess(res, { orders });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const order = await orderRepository.findByIdAndUser(
      getParam(req.params.id),
      req.user!.userId
    );
    if (!order) throw new ApiError(404, "Order not found.");
    sendSuccess(res, { order });
  },
};
