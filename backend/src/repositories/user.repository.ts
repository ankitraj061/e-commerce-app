
import { prisma } from "../lib/prisma.js";
import type { User } from "@prisma/client";

export const userRepository = {
  

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  

  async create(data: {
    name: string;
    email: string;
    password: string;
  }): Promise<User> {
    return prisma.user.create({ data });
  },

  

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
