/**
 * user.routes.ts
 * All routes are protected — require a valid access token.
 *
 * GET    /api/users/me              — full profile (name, email, selected warehouse)
 * PATCH  /api/users/me              — update name
 * PATCH  /api/users/me/warehouse    — set selected warehouse (reservation prerequisite)
 * DELETE /api/users/me/warehouse    — clear warehouse selection
 */

import { Router } from "express";
import { userController } from "../controllers/user.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import {
  selectWarehouseSchema,
  updateProfileSchema,
} from "../validations/user.validation.js";

const router = Router();

router.use(authMiddleware);

router.get("/me", asyncWrapper(userController.getProfile));

router.patch(
  "/me",
  validate(updateProfileSchema),
  asyncWrapper(userController.updateProfile)
);

router.patch(
  "/me/warehouse",
  validate(selectWarehouseSchema),
  asyncWrapper(userController.selectWarehouse)
);

router.delete("/me/warehouse", asyncWrapper(userController.clearWarehouse));

export default router;
