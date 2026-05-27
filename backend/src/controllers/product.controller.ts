/**
 * product.controller.ts
 * Handles GET /api/products and GET /api/products/:id
 * Returns products with per-warehouse inventory including available stock.
 */

import { Request, Response } from "express";
import { inventoryRepository } from "../repositories/inventory.repository.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { getParam } from "../utils/getParam.js";

export const productController = {
  async getAll(_req: Request, res: Response): Promise<void> {
    const products = await inventoryRepository.findAllProductsWithInventory();
    sendSuccess(res, { products });
  },

  async getById(req: Request, res: Response): Promise<void> {
    const product = await inventoryRepository.findProductWithInventory(
      getParam(req.params.id)
    );
    if (!product) throw new ApiError(404, "Product not found.");
    sendSuccess(res, { product });
  },
};
