/**
 * auth.service.ts
 * Business logic for registration, login, token refresh, and logout.
 *
 * Token strategy:
 *   • Access token  — JWT, 15 min, carries { userId, email }
 *   • Refresh token — JWT, 7 days, stored in DB, rotated on every use
 *
 * Refresh token rotation prevents replay attacks:
 *   If a stolen, already-rotated token is presented again → 401 (not in DB).
 */

import { prisma } from "../lib/prisma.js";
import { userRepository } from "../repositories/user.repository.js";
import { refreshTokenRepository } from "../repositories/refreshToken.repository.js";
import { hashPassword, comparePassword } from "../lib/hash.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  refreshTokenExpiresAt,
} from "../lib/jwt.js";
import { ApiError } from "../utils/apiError.js";

export const authService = {
  // ─── Register ──────────────────────────────────────────────────────────────

  async register(data: { name: string; email: string; password: string }) {
    // Check for existing email
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new ApiError(409, "An account with this email already exists.");
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await userRepository.create({
      name: data.name,
      email: data.email,
      password: hashedPassword,
    });

    // Auto-login: issue tokens immediately so the client gets a full session
    // without a separate login round-trip. Matches the shape of authService.login().
    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id });

    await refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: refreshTokenExpiresAt(),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        selectedWarehouseId: user.selectedWarehouseId,
      },
    };
  },

  // ─── Login ─────────────────────────────────────────────────────────────────

  async login(data: { email: string; password: string }) {
    const user = await userRepository.findByEmail(data.email);

    // Use same error message for "not found" and "wrong password" to
    // prevent user enumeration attacks
    if (!user) {
      throw new ApiError(401, "Invalid email or password.");
    }

    const passwordMatch = await comparePassword(data.password, user.password);
    if (!passwordMatch) {
      throw new ApiError(401, "Invalid email or password.");
    }

    const accessToken = signAccessToken({ userId: user.id, email: user.email });
    const refreshToken = signRefreshToken({ userId: user.id });

    // Persist refresh token in DB
    await refreshTokenRepository.create({
      userId: user.id,
      token: refreshToken,
      expiresAt: refreshTokenExpiresAt(),
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        selectedWarehouseId: user.selectedWarehouseId,
      },
    };
  },

  // ─── Refresh access token ──────────────────────────────────────────────────

  async refreshAccessToken(refreshToken: string) {
    // Verify JWT signature and expiry
    let payload: { userId: string };
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new ApiError(401, "Invalid or expired refresh token.");
    }

    // Check DB — if not found, the token was already rotated or revoked
    const stored = await refreshTokenRepository.findByToken(refreshToken);
    if (!stored) {
      throw new ApiError(
        401,
        "Refresh token has been revoked. Please log in again."
      );
    }

    // Check DB-level expiry (belt-and-suspenders over JWT expiry)
    if (stored.expiresAt < new Date()) {
      await refreshTokenRepository.deleteByToken(refreshToken);
      throw new ApiError(401, "Refresh token expired. Please log in again.");
    }

    // ── Rotation: delete old token + create new one atomically ───────────────
    // BUG FIX: Previously two concurrent requests with the same refresh token
    // could both pass the findByToken check, then one would get P2025 on
    // delete (→ unhandled 500). Wrapping in a transaction makes it atomic:
    // the second concurrent DELETE fails cleanly inside the tx and the whole
    // operation is rolled back → 401 instead of 500.
    const newRefreshToken = signRefreshToken({ userId: payload.userId });
    const newExpiresAt = refreshTokenExpiresAt();

    try {
      await prisma.$transaction([
        prisma.refreshToken.delete({ where: { token: refreshToken } }),
        prisma.refreshToken.create({
          data: { userId: payload.userId, token: newRefreshToken, expiresAt: newExpiresAt },
        }),
      ]);
    } catch {
      // Token was already rotated or deleted by a concurrent request
      throw new ApiError(401, "Refresh token has been revoked. Please log in again.");
    }

    const user = await userRepository.findById(payload.userId);
    if (!user) throw new ApiError(404, "User not found.");

    const newAccessToken = signAccessToken({
      userId: user.id,
      email: user.email,
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  },

  // ─── Logout ────────────────────────────────────────────────────────────────

  async logout(refreshToken: string) {
    // Best-effort delete; ignore if token not found (already logged out)
    try {
      await refreshTokenRepository.deleteByToken(refreshToken);
    } catch {
      // no-op
    }
  },

  // ─── Logout all sessions ───────────────────────────────────────────────────

  async logoutAll(userId: string) {
    await refreshTokenRepository.deleteAllForUser(userId);
  },
};
