/**
 * address.routes.ts
 * All routes require authentication.
 *
 * GET    /api/addresses              — list user's delivery addresses
 * POST   /api/addresses              — create a new address
 * GET    /api/addresses/:id          — fetch a single address
 * PATCH  /api/addresses/:id          — update address fields (partial)
 * DELETE /api/addresses/:id          — delete an address
 * PATCH  /api/addresses/:id/default  — mark address as default
 */

import { Router } from "express";
import { addressController } from "../controllers/address.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import {
  createAddressSchema,
  updateAddressSchema,
} from "../validations/address.validation.js";

const router = Router();

router.use(authMiddleware);

router.get("/", asyncWrapper(addressController.list));

router.post(
  "/",
  validate(createAddressSchema),
  asyncWrapper(addressController.create)
);

router.get("/:id", asyncWrapper(addressController.getById));

router.patch(
  "/:id",
  validate(updateAddressSchema),
  asyncWrapper(addressController.update)
);

router.delete("/:id", asyncWrapper(addressController.remove));

router.patch("/:id/default", asyncWrapper(addressController.setDefault));

export default router;
