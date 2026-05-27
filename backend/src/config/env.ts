/**
 * env.ts
 * Centralised, typed environment variable validation using Zod.
 * The process exits immediately if any required variable is missing or malformed.
 * Import `env` everywhere instead of accessing process.env directly.
 */

import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
  // Server
  PORT: z.string().default("8000"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Database (Neon PostgreSQL)
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Upstash Redis REST client
  UPSTASH_REDIS_REST_URL: z
    .string()
    .url("UPSTASH_REDIS_REST_URL must be a valid URL"),
  UPSTASH_REDIS_REST_TOKEN: z
    .string()
    .min(1, "UPSTASH_REDIS_REST_TOKEN is required"),

  // JWT secrets
  ACCESS_TOKEN_SECRET: z
    .string()
    .min(32, "ACCESS_TOKEN_SECRET must be at least 32 characters"),
  REFRESH_TOKEN_SECRET: z
    .string()
    .min(32, "REFRESH_TOKEN_SECRET must be at least 32 characters"),
  ACCESS_TOKEN_EXPIRY: z.string().default("15m"),
  REFRESH_TOKEN_EXPIRY_DAYS: z.string().default("7"),

  // Razorpay (test mode)
  RAZORPAY_KEY_ID: z.string().min(1, "RAZORPAY_KEY_ID is required"),
  RAZORPAY_KEY_SECRET: z.string().min(1, "RAZORPAY_KEY_SECRET is required"),

  // Cron job secret — validated by /api/internal/cron/* endpoints.
  // Must match the X-Cron-Secret header sent by Google Cloud Scheduler.
  CRON_SECRET: z
    .string()
    .min(32, "CRON_SECRET must be at least 32 characters")
    .optional()
    .default("dev-cron-secret-not-used-in-dev"),

  // CORS — comma-separated allowed frontend origins (production only)
  ALLOWED_ORIGINS: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌  Invalid environment variables:");
  parsed.error.issues.forEach((issue) => {
    console.error(`   ${issue.path.join(".")}: ${issue.message}`);
  });
  process.exit(1);
}

export const env = parsed.data;
