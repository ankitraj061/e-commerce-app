import { api } from "./api";
import type { RazorpayOrder, CreatePaymentOrderPayload } from "@/types";

export const paymentService = {
  async createOrder(payload: CreatePaymentOrderPayload): Promise<RazorpayOrder> {
    const { data } = await api.post<{ data: { payment: RazorpayOrder } }>(
      "/payments/create-order",
      payload
    );
    return data.data.payment;
  },
};
