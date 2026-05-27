
import { prisma } from "../lib/prisma.js";
import type { CreateAddressInput, UpdateAddressInput } from "../validations/address.validation.js";

export const addressRepository = {
  async findAllByUser(userId: string) {
    return prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  },

  async findByIdAndUser(id: string, userId: string) {
    return prisma.address.findFirst({ where: { id, userId } });
  },

  async create(userId: string, data: CreateAddressInput) {
    
    return prisma.$transaction(async (tx) => {
      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }
      return tx.address.create({ data: { ...data, userId } });
    });
  },

  async update(id: string, userId: string, data: UpdateAddressInput) {
    return prisma.$transaction(async (tx) => {
      
      const existing = await tx.address.findFirst({ where: { id, userId } });
      if (!existing) return null;

      if (data.isDefault) {
        await tx.address.updateMany({
          where: { userId, isDefault: true },
          data: { isDefault: false },
        });
      }
      return tx.address.update({ where: { id }, data });
    });
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const result = await prisma.address.deleteMany({ where: { id, userId } });
    return result.count > 0;
  },

  async setDefault(id: string, userId: string) {
    return prisma.$transaction(async (tx) => {
      const existing = await tx.address.findFirst({ where: { id, userId } });
      if (!existing) return null;

      await tx.address.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
      return tx.address.update({
        where: { id },
        data: { isDefault: true },
      });
    });
  },
};
