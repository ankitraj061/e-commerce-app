/**
 * src/index.ts
 * Application entry point.
 *
 * Boot order:
 *  1. Import config/env.ts first — validates env vars and exits on failure.
 *  2. Create and configure the Express app.
 *  3. Register all API routes under /api.
 *  4. Register the global error handler LAST.
 *  5. Start the HTTP server.
 *  6. Start the reservation-expiry background job.
 */

// ── 1. Env validation (must be first import) ───────────────────────────────────
import "./config/env.js";

import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import apiRouter from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.middleware.js";
import { startReservationExpiryJob } from "./jobs/releaseExpiredReservations.js";
import { connectWithRetry } from "./lib/prisma.js";

// ── 2. Express app ─────────────────────────────────────────────────────────────

const app = express();

// ── 3. Global middleware ───────────────────────────────────────────────────────

app.use(
  cors({
    origin:
      env.NODE_ENV === "production"
        ? process.env.ALLOWED_ORIGINS?.split(",") ?? []
        : true, // Allow all origins in development
    credentials: true, // Required for HttpOnly cookies
  })
);

app.use(express.json({ limit: "10kb" })); // Limit request body size
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Parses cookies (needed for refresh token)

// ── 4. Health check ────────────────────────────────────────────────────────────

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── 5. API routes ──────────────────────────────────────────────────────────────

app.use("/api", apiRouter);

// ── 6. 404 handler ────────────────────────────────────────────────────────────

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: "Route not found." });
});

// ── 7. Global error handler (MUST be last) ────────────────────────────────────

app.use(errorHandler);

// ── 8. Start server ────────────────────────────────────────────────────────────

const PORT = parseInt(env.PORT, 10);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`   Environment : ${env.NODE_ENV}`);
  console.log(`   API base URL: http://localhost:${PORT}/api`);

  // ── 9. Warm up the DB, then start background jobs ───────────────────────────
  // Neon computes auto-suspend after ~5 min of inactivity. The first connection
  // attempt often fails with ETIMEDOUT while the compute wakes up (~1 s).
  // connectWithRetry absorbs that window before we start background jobs.
  connectWithRetry()
    .then(() => startReservationExpiryJob())
    .catch((err) => {
      console.error("❌ Failed to connect to database on startup:", err.message);
      process.exit(1);
    });
});

export default app;
