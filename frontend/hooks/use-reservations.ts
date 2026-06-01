import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationService } from "@/services/reservation.service";
import { PRODUCTS_KEY } from "@/hooks/use-products";
import type { ReservationListItem } from "@/types";

export const RESERVATIONS_KEY = ["reservations"] as const;

export function useReservations(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: RESERVATIONS_KEY,
    queryFn: reservationService.list,
    staleTime: 30 * 1000,
    refetchInterval: 30_000,
    enabled: options?.enabled !== false,
  });
}

export function useReleaseReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reservationService.release(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RESERVATIONS_KEY });
      queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY });
    },
  });
}

export function useActivePendingReservations(options?: { enabled?: boolean }) {
  const query = useQuery({
    queryKey: RESERVATIONS_KEY,
    queryFn: reservationService.list,
    staleTime: 30 * 1000,
    refetchInterval: 30_000,
    enabled: options?.enabled !== false,
  });

  const active = (query.data ?? []).filter(
    (r): r is ReservationListItem =>
      r.status === "PENDING" && new Date(r.expiresAt) > new Date()
  );

  return { ...query, active };
}
