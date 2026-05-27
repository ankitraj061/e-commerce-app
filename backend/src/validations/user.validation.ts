
import { z } from "zod";

export const selectWarehouseSchema = z.object({
  warehouseId: z.string().cuid("Invalid warehouse ID"),
});

export type SelectWarehouseInput = z.infer<typeof selectWarehouseSchema>;

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
