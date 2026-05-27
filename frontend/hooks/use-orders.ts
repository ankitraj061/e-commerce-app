import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export function useCancelOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => orderService.cancel(id),
    onSuccess: (updatedOrder) => {
      
      queryClient.setQueryData([...ORDERS_KEY, updatedOrder.id], updatedOrder);
      
      queryClient.invalidateQueries({ queryKey: ORDERS_KEY });
    },
  });
}
