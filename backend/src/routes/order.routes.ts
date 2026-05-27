/**
 * order.routes.ts
 *
 * GET /api/orders       — list user's orders
 * GET /api/orders/:id   — single order detail
 */

import { Router } from "express";
import { orderController } from "../controllers/order.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";

const router = Router();

router.use(authMiddleware);

router.get("/", asyncWrapper(orderController.list));
router.get("/:id", asyncWrapper(orderController.getById));
router.patch("/:id/cancel", asyncWrapper(orderController.cancel));

export default router;
