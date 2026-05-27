import { api } from "./api";
import type {
  ReservationListItem,
  ReservationWithDetails,
  CreateReservationPayload,
  ConfirmReservationPayload,
  Order,
} from "@/types";

export const reservationService = {
  async create(
    payload: CreateReservationPayload,
    idempotencyKey: string
  ): Promise<ReservationWithDetails> {
    const { data } = await api.post<{ data: { reservation: ReservationWithDetails } }>(
      "/reservations",
      payload,
      { headers: { "Idempotency-Key": idempotencyKey } }
    );
    return data.data.reservation;
  },

  /** Returns all reservations for the current user, including payment info. */
  async list(): Promise<ReservationListItem[]> {
    const { data } = await api.get<{ data: { reservations: ReservationListItem[] } }>("/reservations");
    return data.data.reservations;
  },

  async getById(id: string): Promise<ReservationWithDetails> {
    const { data } = await api.get<{ data: { reservation: ReservationWithDetails } }>(
      `/reservations/${id}`
    );
    return data.data.reservation;
  },

  async confirm(id: string, payload: ConfirmReservationPayload, idempotencyKey: string): Promise<Order> {
    const { data } = await api.post<{ data: { order: Order } }>(
      `/reservations/${id}/confirm`,
      payload,
      { headers: { "Idempotency-Key": idempotencyKey } }
    );
    return data.data.order;
  },

  async release(id: string): Promise<void> {
    await api.post(`/reservations/${id}/release`);
  },
};
