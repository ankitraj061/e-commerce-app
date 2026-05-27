/**
 * inventory.repository.ts
 * Read-only inventory queries.
 * ALL stock mutations happen inside Prisma transactions in the
 * reservation service (via raw SQL locking) — never through this repository.
 */

import { prisma } from "../lib/prisma.js";

export const inventoryRepository = {
  /**
   * Return all products with their per-warehouse inventory.
   * Computes `available = totalStock - reservedStock` in application code
   * to keep the DB query simple and avoid computed-column coupling.
   */
  async findAllProductsWithInventory() {
    const products = await prisma.product.findMany({
      include: {
        inventories: {
          include: {
            warehouse: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return products.map((product) => ({
      ...product,
      inventories: product.inventories.map((inv) => ({
        ...inv,
        available: inv.totalStock - inv.reservedStock,
      })),
    }));
  },

  /**
   * Single product with full inventory breakdown across all warehouses.
   */
  async findProductWithInventory(productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        inventories: {
          include: { warehouse: true },
        },
      },
    });

    if (!product) return null;

    return {
      ...product,
      inventories: product.inventories.map((inv) => ({
        ...inv,
        available: inv.totalStock - inv.reservedStock,
      })),
    };
  },
};
