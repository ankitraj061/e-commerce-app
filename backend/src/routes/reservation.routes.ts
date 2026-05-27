
import { Router } from "express";
import { reservationController } from "../controllers/reservation.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { idempotencyMiddleware } from "../middleware/idempotency.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import {
  createReservationSchema,
  confirmReservationSchema,
} from "../validations/reservation.validation.js";

const router = Router();

router.use(authMiddleware);

router.post(
  "/",
  idempotencyMiddleware("idem:reserve"),
  validate(createReservationSchema),
  asyncWrapper(reservationController.create)
);

router.get("/", asyncWrapper(reservationController.list));

router.get("/:id", asyncWrapper(reservationController.getById));

router.post(
  "/:id/confirm",
  idempotencyMiddleware("idem:confirm"),
  validate(confirmReservationSchema),
  asyncWrapper(reservationController.confirm)
);

router.post(
  "/:id/release",
  asyncWrapper(reservationController.release)
);

export default router;
