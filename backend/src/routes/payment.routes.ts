
import { Router } from "express";
import { paymentController } from "../controllers/payment.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import { createPaymentOrderSchema } from "../validations/payment.validation.js";

const router = Router();

router.use(authMiddleware);

router.post(
  "/create-order",
  validate(createPaymentOrderSchema),
  asyncWrapper(paymentController.createOrder)
);

export default router;
