

import "./config/env.js";

import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import apiRouter from "./routes/index.js";
import { errorHandler } from "./middleware/errorHandler.middleware.js";
import { startReservationExpiryJob } from "./jobs/releaseExpiredReservations.js";
import { connectWithRetry } from "./lib/prisma.js";

const app = express();

app.use(
  cors({
    origin:
      env.NODE_ENV === "production"
        ? process.env.ALLOWED_ORIGINS?.split(",") ?? []
        : true, 
    credentials: true, 
  })
);

app.use(express.json({ limit: "10kb" })); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); 

app.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api", apiRouter);

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: "Route not found." });
});

app.use(errorHandler);

const PORT = parseInt(env.PORT, 10);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`   Environment : ${env.NODE_ENV}`);
  console.log(`   API base URL: http://localhost:${PORT}/api`);

  
  
  
  
  connectWithRetry()
    .then(() => startReservationExpiryJob())
    .catch((err) => {
      console.error("❌ Failed to connect to database on startup:", err.message);
      process.exit(1);
    });
});

export default app;
