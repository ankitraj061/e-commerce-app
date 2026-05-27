
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export interface AccessTokenPayload {
  userId: string;
  email: string;
}

export interface RefreshTokenPayload {
  userId: string;
}

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

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.ACCESS_TOKEN_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.REFRESH_TOKEN_SECRET) as RefreshTokenPayload;
}

export function refreshTokenExpiresAt(): Date {
  const days = parseInt(env.REFRESH_TOKEN_EXPIRY_DAYS, 10);
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
