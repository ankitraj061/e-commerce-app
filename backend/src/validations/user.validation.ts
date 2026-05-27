/**
 * user.validation.ts
 * Zod schemas for user profile update operations.
 */

import { z } from "zod";

// ─── Select / update warehouse ─────────────────────────────────────────────────

export const selectWarehouseSchema = z.object({
  warehouseId: z.string().cuid("Invalid warehouse ID"),
});

export type SelectWarehouseInput = z.infer<typeof selectWarehouseSchema>;

// ─── Update profile (name only — email change needs its own flow) ──────────────

export const updateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
