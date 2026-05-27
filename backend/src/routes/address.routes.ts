
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
