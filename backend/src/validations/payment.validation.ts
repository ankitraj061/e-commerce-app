/**
 * payment.validation.ts
 * Zod schemas for payment-related requests.
 */

import { z } from "zod";

// ─── Create Razorpay order ─────────────────────────────────────────────────────

export const createPaymentOrderSchema = z.object({
  reservationId: z.string().cuid("Invalid reservation ID"),
});

export type CreatePaymentOrderInput = z.infer<typeof createPaymentOrderSchema>;
