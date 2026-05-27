import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reservationService } from "@/services/reservation.service";
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

/**
 * Releases (cancels) a reservation and immediately invalidates the cache so
 * the payments list stops showing the "Continue to Pay" button.
 */
export function useReleaseReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reservationService.release(id),
    onSuccess: () => {
      // Force an instant refetch — the list page will re-render with
      // status=RELEASED and hide the Pay button straight away.
      queryClient.invalidateQueries({ queryKey: RESERVATIONS_KEY });
    },
  });
}

/**
 * Lightweight hook for the Navbar / banners.
 * Only fetches when `enabled` is true (pass `isAuthenticated` from auth store).
 * Returns only PENDING reservations that have not yet expired.
 */
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
