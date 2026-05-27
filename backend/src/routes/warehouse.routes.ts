/**
 * warehouse.routes.ts
 * GET /api/warehouses       — list all warehouses
 * GET /api/warehouses/:id   — single warehouse with inventory
 */

import { Router } from "express";
import { warehouseController } from "../controllers/warehouse.controller.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";

const router = Router();

router.get("/", asyncWrapper(warehouseController.getAll));
router.get("/:id", asyncWrapper(warehouseController.getById));

export default router;
