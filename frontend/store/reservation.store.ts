import { create } from "zustand";
import type { ReservationWithDetails } from "@/types";

interface ReservationState {
  activeReservation: ReservationWithDetails | null;
  setActiveReservation: (r: ReservationWithDetails | null) => void;
  clearReservation: () => void;
}

export const useReservationStore = create<ReservationState>()((set) => ({
  activeReservation: null,
  setActiveReservation: (r) => set({ activeReservation: r }),
  clearReservation: () => set({ activeReservation: null }),
}));
