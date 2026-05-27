/**
 * hash.ts
 * Thin wrappers around bcryptjs for password hashing and comparison.
 * bcryptjs is pure-JS (no native bindings) — safe on all platforms.
 */

import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12; // ~250 ms on a typical server; increase for stronger security

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function comparePassword(
  plain: string,
  hashed: string
): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}
