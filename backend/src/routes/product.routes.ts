/**
 * product.routes.ts
 * GET /api/products       — list all products with inventory
 * GET /api/products/:id   — single product with inventory
 */

import { Router } from "express";
import { productController } from "../controllers/product.controller.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";

const router = Router();

router.get("/", asyncWrapper(productController.getAll));
router.get("/:id", asyncWrapper(productController.getById));

export default router;
