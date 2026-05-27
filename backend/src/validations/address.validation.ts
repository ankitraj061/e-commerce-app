/**
 * address.validation.ts
 * Zod schemas for delivery address operations.
 */

import { z } from "zod";

const baseAddressSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z
    .string()
    .regex(/^\+?[0-9]{7,15}$/, "Invalid phone number"),
  street: z.string().min(3, "Street is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pincode: z
    .string()
    .regex(/^[0-9]{4,10}$/, "Invalid pincode"),
  country: z.string().min(2, "Country is required"),
  isDefault: z.boolean().optional().default(false),
});

// ─── Create address ────────────────────────────────────────────────────────────

export const createAddressSchema = baseAddressSchema;
export type CreateAddressInput = z.infer<typeof createAddressSchema>;

// ─── Update address (all fields optional) ─────────────────────────────────────

export const updateAddressSchema = baseAddressSchema.partial();
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;

// ─── Params ───────────────────────────────────────────────────────────────────

export const addressParamsSchema = z.object({
  id: z.string().cuid("Invalid address ID"),
});
export type AddressParams = z.infer<typeof addressParamsSchema>;
