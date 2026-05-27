/**
 * auth.routes.ts
 * POST /api/auth/register
 * POST /api/auth/login
 * POST /api/auth/refresh-token   (uses HttpOnly cookie)
 * POST /api/auth/logout          (uses HttpOnly cookie)
 * POST /api/auth/logout-all      (protected — revoke all sessions)
 * GET  /api/auth/me              (protected — current user info)
 */

import { Router } from "express";
import { authController } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { asyncWrapper } from "../utils/asyncWrapper.js";
import {
  registerSchema,
  loginSchema,
} from "../validations/auth.validation.js";

const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  asyncWrapper(authController.register)
);

router.post(
  "/login",
  validate(loginSchema),
  asyncWrapper(authController.login)
);

router.post("/refresh-token", asyncWrapper(authController.refreshToken));

router.post("/logout", asyncWrapper(authController.logout));

// Protected routes
router.post(
  "/logout-all",
  authMiddleware,
  asyncWrapper(authController.logoutAll)
);

router.get("/me", authMiddleware, asyncWrapper(authController.me));

export default router;
