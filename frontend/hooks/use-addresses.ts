import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addressService } from "@/services/address.service";
import type { CreateAddressPayload } from "@/types";

export const ADDRESSES_KEY = ["addresses"] as const;

export function useAddresses() {
  return useQuery({
    queryKey: ADDRESSES_KEY,
    queryFn: addressService.getAll,
    staleTime: 60 * 1000,
  });
}

export function useCreateAddress() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAddressPayload) => addressService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADDRESSES_KEY });
    },
  });
}
