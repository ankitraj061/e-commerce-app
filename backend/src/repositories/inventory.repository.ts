
import { prisma } from "../lib/prisma.js";

export const inventoryRepository = {
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
