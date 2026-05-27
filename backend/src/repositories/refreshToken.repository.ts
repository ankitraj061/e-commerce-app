/**
 * refreshToken.repository.ts
 * Database operations for the RefreshToken model.
 * Used during login, token refresh, and logout flows.
 */

import { prisma } from "../lib/prisma.js";
import type { RefreshToken } from "@prisma/client";

export const refreshTokenRepository = {
  // ── Create ──────────────────────────────────────────────────────────────────

  async create(data: {
    userId: string;
    token: string;
    expiresAt: Date;
  }): Promise<RefreshToken> {
    return prisma.refreshToken.create({ data });
  },

  // ── Read ────────────────────────────────────────────────────────────────────

  async findByToken(token: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({ where: { token } });
  },

  // ── Delete (logout / rotation) ───────────────────────────────────────────────

  async deleteByToken(token: string): Promise<void> {
    await prisma.refreshToken.delete({ where: { token } });
  },

  async deleteAllForUser(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({ where: { userId } });
  },
};
