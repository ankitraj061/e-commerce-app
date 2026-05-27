import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Warehouse } from "@/types";

interface WarehouseState {
  selectedWarehouse: Warehouse | null;
  setSelectedWarehouse: (warehouse: Warehouse | null) => void;
  clearWarehouse: () => void;
}

export const useWarehouseStore = create<WarehouseState>()(
  persist(
    (set) => ({
      selectedWarehouse: null,
      setSelectedWarehouse: (warehouse) => set({ selectedWarehouse: warehouse }),
      clearWarehouse: () => set({ selectedWarehouse: null }),
    }),
    {
      name: "bharatbazaar-warehouse",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
