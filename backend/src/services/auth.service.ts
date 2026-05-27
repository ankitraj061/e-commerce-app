
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
  

  async register(data: { name: string; email: string; password: string }) {
    
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

  

  async login(data: { email: string; password: string }) {
    const user = await userRepository.findByEmail(data.email);

    
    
    if (!user) {
      throw new ApiError(401, "Invalid email or password.");
    }

    const passwordMatch = await comparePassword(data.password, user.password);
    if (!passwordMatch) {
      throw new ApiError(401, "Invalid email or password.");
    }

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

  

  async refreshAccessToken(refreshToken: string) {
    
    let payload: { userId: string };
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      throw new ApiError(401, "Invalid or expired refresh token.");
    }

    
    const stored = await refreshTokenRepository.findByToken(refreshToken);
    if (!stored) {
      throw new ApiError(
        401,
        "Refresh token has been revoked. Please log in again."
      );
    }

    
    if (stored.expiresAt < new Date()) {
      await refreshTokenRepository.deleteByToken(refreshToken);
      throw new ApiError(401, "Refresh token expired. Please log in again.");
    }

    
    
    
    
    
    
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

  

  async logout(refreshToken: string) {
    
    try {
      await refreshTokenRepository.deleteByToken(refreshToken);
    } catch {
      
    }
  },

  

  async logoutAll(userId: string) {
    await refreshTokenRepository.deleteAllForUser(userId);
  },
};
