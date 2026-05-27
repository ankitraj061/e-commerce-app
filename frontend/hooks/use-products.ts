import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service";

export const PRODUCTS_KEY = ["products"] as const;

export function useProducts() {
  return useQuery({
    queryKey: PRODUCTS_KEY,
    queryFn: productService.getAll,
    staleTime: 30 * 1000,
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, id],
    queryFn: () => productService.getById(id),
    enabled: !!id,
  });
}
