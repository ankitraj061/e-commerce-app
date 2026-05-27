import { useQuery } from "@tanstack/react-query";
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
