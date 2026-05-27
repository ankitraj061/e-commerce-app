import { api } from "./api";
import type { Order, OrderWithDetails } from "@/types";

export const orderService = {
  async list(): Promise<Order[]> {
    const { data } = await api.get<{ data: { orders: Order[] } }>("/orders");
    return data.data.orders;
  },

  async getById(id: string): Promise<OrderWithDetails> {
    const { data } = await api.get<{ data: { order: OrderWithDetails } }>(`/orders/${id}`);
    return data.data.order;
  },

  async cancel(id: string): Promise<OrderWithDetails> {
    const { data } = await api.patch<{ data: { order: OrderWithDetails } }>(`/orders/${id}/cancel`);
    return data.data.order;
  },
};
