/**
 * prisma.ts
 * Singleton Prisma Client for Prisma 7.
 *
 * Prisma 7 removed `url = env(...)` from schema.prisma.
 * The connection is provided via the `@prisma/adapter-pg` driver adapter,
 * which wraps the existing pg.Pool with the DATABASE_URL from the environment.
 *
 * In development, we attach the instance to `globalThis` so tsx watch
 * hot-reloads don't open dozens of parallel connections.
 *
 * ── Neon cold-start resilience ──────────────────────────────────────────────
 * Neon serverless computes auto-suspend after ~5 min of inactivity. The first
 * connection attempt after suspension often fails with ETIMEDOUT (< 1 s) while
 * the compute is waking up. We handle this with:
 *   1. keepAlive: true  – TCP keep-alives prevent mid-query drops once warm.
 *   2. idleTimeoutMillis: 60_000 – keep pool connections alive for 60 s of
 *      inactivity, reducing how often we need to reconnect to a cold compute.
 *   3. connectWithRetry() – exported helper used at startup to ping the DB
 *      with up to 5 retries / 2 s backoff before serving traffic or running
 *      background jobs.
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function createPool(): Pool {
  const dbUrl = process.env.DATABASE_URL!;

  // pg-connection-string's `sslmode=require` is now treated as `verify-full`,
  // which conflicts with how we want to set up SSL (rejectUnauthorized: false).
  // Parsing the URL manually and passing explicit options to pg.Pool avoids
  // the connection-string SSL parameter confusion entirely.
  const url = new URL(dbUrl);

  return new Pool({
    host: url.hostname,
    port: url.port ? parseInt(url.port, 10) : 5432,
    database: url.pathname.replace(/^\//, ""),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    // Neon requires TLS; the cert is valid but we skip CA verification
    // to avoid issues with pg-connection-string sslmode param parsing.
    ssl: { rejectUnauthorized: false },
    // Keep TCP connections alive so in-flight queries survive transient blips.
    keepAlive: true,
    // Hold idle connections for 60 s; reduces cold-start exposure between
    // back-to-back requests while still releasing connections when truly idle.
    idleTimeoutMillis: 60_000,
    // Max time to acquire a connection from the pool.
    connectionTimeoutMillis: 15_000,
  });
}

function createPrismaClient(): PrismaClient {
  const pool = globalForPrisma.pool ?? createPool();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
  }

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["warn", "error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * connectWithRetry
 *
 * Pings the database and retries on ETIMEDOUT / ECONNRESET.
 * Call once at server startup (before starting background jobs or accepting
 * traffic) to absorb the Neon cold-start window.
 *
 * @param maxAttempts  Number of attempts before giving up (default 5).
 * @param delayMs      Initial delay between retries in ms (doubles each time).
 */
export async function connectWithRetry(
  maxAttempts = 5,
  delayMs = 2_000
): Promise<void> {
  const RETRYABLE = new Set(["ETIMEDOUT", "ECONNRESET", "ECONNREFUSED"]);

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      if (attempt > 1) {
        console.log(`[db] Connected after ${attempt} attempt(s).`);
      }
      return;
    } catch (err: unknown) {
      const code = (err as { code?: string }).code;
      const isRetryable = RETRYABLE.has(code ?? "");

      if (!isRetryable || attempt === maxAttempts) {
        throw err;
      }

      const wait = delayMs * attempt; // 2 s, 4 s, 6 s, 8 s …
      console.warn(
        `[db] Connection attempt ${attempt}/${maxAttempts} failed (${code}). ` +
          `Retrying in ${wait / 1000}s… (Neon compute may be waking up)`
      );
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}
