import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/services/order.service";

export const ORDERS_KEY = ["orders"] as const;

export function useOrders() {
  return useQuery({
    queryKey: ORDERS_KEY,
    queryFn: orderService.list,
    staleTime: 30 * 1000,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: [...ORDERS_KEY, id],
    queryFn: () => orderService.getById(id),
    enabled: !!id,
  });
}
