
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
