
import { z } from "zod";

export const createReservationSchema = z.object({
  productId: z.string().cuid("Invalid product ID"),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(100, "Quantity cannot exceed 100 per reservation"),
  deliveryAddressId: z.string().cuid("Invalid address ID"),
});

export type CreateReservationInput = z.infer<typeof createReservationSchema>;

export const confirmReservationSchema = z.object({
  razorpayOrderId: z.string().min(1, "Razorpay order ID is required"),
  razorpayPaymentId: z.string().min(1, "Razorpay payment ID is required"),
  razorpaySignature: z.string().min(1, "Razorpay signature is required"),
});

export type ConfirmReservationInput = z.infer<typeof confirmReservationSchema>;

export const reservationParamsSchema = z.object({
  id: z.string().cuid("Invalid reservation ID"),
});

export type ReservationParams = z.infer<typeof reservationParamsSchema>;
