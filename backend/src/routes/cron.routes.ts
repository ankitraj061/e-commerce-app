/**
 * cron.routes.ts
 * Internal routes called by Google Cloud Scheduler.
 * Protected by X-Cron-Secret header — not for public use.
 */

import { Router } from "express";
import { cronController } from "../controllers/cron.controller.js";

const router = Router();

// POST /api/internal/cron/release-reservations
// Called by Cloud Scheduler every minute.
router.post("/release-reservations", cronController.releaseExpiredReservations);

export default router;
