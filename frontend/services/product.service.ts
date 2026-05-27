import { api } from "./api";
import type { ProductWithInventory } from "@/types";

export const productService = {
  async getAll(): Promise<ProductWithInventory[]> {
    const { data } = await api.get<{ data: { products: ProductWithInventory[] } }>("/products");
    return data.data.products;
  },

  async getById(id: string): Promise<ProductWithInventory> {
    const { data } = await api.get<{ data: { product: ProductWithInventory } }>(
      `/products/${id}`
    );
    return data.data.product;
  },
};
