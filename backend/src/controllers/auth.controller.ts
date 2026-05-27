/**
 * auth.controller.ts
 * HTTP layer for auth routes. Delegates all business logic to authService.
 *
 * Cookie strategy:
 *   The refresh token is stored in an HttpOnly, Secure, SameSite=None cookie.
 *   SameSite=None is required when frontend and backend are on different origins
 *   (e.g. vercel.app frontend → render.com backend). Must be Secure=true.
 *   The access token is returned in the JSON body; client stores it in memory only.
 */

import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { authService } from "../services/auth.service.js";
import { sendSuccess } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { env } from "../config/env.js";

const REFRESH_TOKEN_COOKIE = "refreshToken";
const REFRESH_TOKEN_MAX_AGE_MS =
  parseInt(env.REFRESH_TOKEN_EXPIRY_DAYS, 10) * 24 * 60 * 60 * 1000;

// ─── Cookie options ────────────────────────────────────────────────────────────

function refreshCookieOptions() {
  const isProduction = env.NODE_ENV === "production";
  return {
    httpOnly: true,
    // SameSite=None requires Secure=true (browser enforced).
    // In production the frontend and backend are on different origins so we
    // need SameSite=None to allow the cookie to be sent cross-site.
    secure: isProduction,
    sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
    maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    path: "/",
  };
}

// ─── Controllers ──────────────────────────────────────────────────────────────

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const { accessToken, refreshToken, user } = await authService.register(req.body);
    // Set the HttpOnly refresh token cookie — same as login so the client
    // gets a full authenticated session immediately after registration.
    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshCookieOptions());
    sendSuccess(res, { accessToken, user }, "Account created successfully.", 201);
  },

  async login(req: Request, res: Response): Promise<void> {
    const { accessToken, refreshToken, user } = await authService.login(
      req.body
    );

    res.cookie(REFRESH_TOKEN_COOKIE, refreshToken, refreshCookieOptions());

    sendSuccess(res, { accessToken, user }, "Logged in successfully.");
  },

  async refreshToken(req: Request, res: Response): Promise<void> {
    const token = req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;

    if (!token) {
      throw new ApiError(401, "Refresh token not found. Please log in.");
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await authService.refreshAccessToken(token);

    // Rotate cookie
    res.cookie(REFRESH_TOKEN_COOKIE, newRefreshToken, refreshCookieOptions());

    sendSuccess(res, { accessToken }, "Token refreshed successfully.");
  },

  async logout(req: Request, res: Response): Promise<void> {
    const token = req.cookies?.[REFRESH_TOKEN_COOKIE] as string | undefined;

    if (token) {
      await authService.logout(token);
    }

    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/" });
    sendSuccess(res, null, "Logged out successfully.");
  },

  async logoutAll(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    await authService.logoutAll(userId);
    res.clearCookie(REFRESH_TOKEN_COOKIE, { path: "/" });
    sendSuccess(res, null, "Logged out from all devices.");
  },

  async me(req: Request, res: Response): Promise<void> {
    // BUG FIX: req.user only carries { userId, email } from the JWT payload.
    // The frontend needs name, selectedWarehouseId, addresses etc.
    // Do a fresh DB read so the client always gets current profile data.
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        name: true,
        email: true,
        selectedWarehouseId: true,
        selectedWarehouse: { select: { id: true, name: true, city: true } },
        createdAt: true,
      },
    });

    if (!user) throw new ApiError(404, "User not found.");

    sendSuccess(res, { user });
  },
};
