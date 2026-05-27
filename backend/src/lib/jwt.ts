/**
 * jwt.ts
 * Helpers for signing and verifying access and refresh tokens.
 *
 * Access token  → short-lived (15 min default), carries userId + email
 * Refresh token → long-lived (7 days default), carries only userId
 *
 * Both token types are signed with *separate* secrets so a compromised
 * access-token secret cannot be used to forge refresh tokens.
 */

import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

// ─── Payload shapes ────────────────────────────────────────────────────────────

export interface AccessTokenPayload {
  userId: string;
  email: string;
}

export interface RefreshTokenPayload {
  userId: string;
}

// ─── Sign helpers ──────────────────────────────────────────────────────────────

export function signAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.ACCESS_TOKEN_SECRET, {
    expiresIn: env.ACCESS_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"],
  });
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  const days = parseInt(env.REFRESH_TOKEN_EXPIRY_DAYS, 10);
  return jwt.sign(payload, env.REFRESH_TOKEN_SECRET, {
    expiresIn: `${days}d` as jwt.SignOptions["expiresIn"],
  });
}

// ─── Verify helpers ────────────────────────────────────────────────────────────

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
}

// ─── Refresh token expiry date ─────────────────────────────────────────────────

export function refreshTokenExpiresAt(): Date {
  const days = parseInt(env.REFRESH_TOKEN_EXPIRY_DAYS, 10);
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
