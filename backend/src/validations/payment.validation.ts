
import { z } from "zod";

export const createPaymentOrderSchema = z.object({
  reservationId: z.string().cuid("Invalid reservation ID"),
});

export type CreatePaymentOrderInput = z.infer<typeof createPaymentOrderSchema>;
