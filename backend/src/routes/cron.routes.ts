
import { Router } from "express";
import { cronController } from "../controllers/cron.controller.js";

const router = Router();

router.post("/release-reservations", cronController.releaseExpiredReservations);

export default router;
