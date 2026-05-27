import { useQuery } from "@tanstack/react-query";
import { warehouseService } from "@/services/warehouse.service";

export const WAREHOUSES_KEY = ["warehouses"] as const;

export function useWarehouses() {
  return useQuery({
    queryKey: WAREHOUSES_KEY,
    queryFn: warehouseService.getAll,
    staleTime: 5 * 60 * 1000,
  });
}

export function useWarehouse(id: string) {
  return useQuery({
    queryKey: [...WAREHOUSES_KEY, id],
    queryFn: () => warehouseService.getById(id),
    enabled: !!id,
  });
}
