import { api } from "./api";
import type { Warehouse, WarehouseWithInventory } from "@/types";

export const warehouseService = {
  async getAll(): Promise<Warehouse[]> {
    const { data } = await api.get<{ data: { warehouses: Warehouse[] } }>("/warehouses");
    return data.data.warehouses;
  },

  async getById(id: string): Promise<WarehouseWithInventory> {
    const { data } = await api.get<{ data: { warehouse: WarehouseWithInventory } }>(
      `/warehouses/${id}`
    );
    return data.data.warehouse;
  },

  async selectWarehouse(warehouseId: string): Promise<void> {
    await api.patch("/users/me/warehouse", { warehouseId });
  },
};
