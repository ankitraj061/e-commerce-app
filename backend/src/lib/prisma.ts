
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

      const wait = delayMs * attempt; 
      console.warn(
        `[db] Connection attempt ${attempt}/${maxAttempts} failed (${code}). ` +
          `Retrying in ${wait / 1000}s… (Neon compute may be waking up)`
      );
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}
