/**
 * user.repository.ts
 * All database operations for the User model.
 * Services call repositories; repositories call Prisma directly.
 */

import { prisma } from "../lib/prisma.js";
import type { User } from "@prisma/client";

export const userRepository = {
  // ── Read ────────────────────────────────────────────────────────────────────

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  // ── Create ──────────────────────────────────────────────────────────────────

  async create(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    return prisma.user.create({ data });
  },

  // ── Update ──────────────────────────────────────────────────────────────────

  async updateSelectedWarehouse(
    userId: string,
    warehouseId: string
  ): Promise<User> {
    return prisma.user.update({
      where: { id: userId },
      data: { selectedWarehouseId: warehouseId },
    });
  },
};
