import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import helmet from "helmet";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { rateLimit } from "express-rate-limit";
import { Server as SocketIOServer } from "socket.io";
import { env } from "./config/env.js";
import { connectDB } from "./db/connection.js";
import { setupSocket } from "./socket/index.js";
import { initWorker } from "./queue/generate-paper.worker.js";
import { errorHandler } from "./middleware/error-handler.js";
import assignmentRoutes from "./routes/assignments.js";
import paperRoutes from "./routes/papers.js";
import toolkitRoutes from "./routes/toolkit.js";
import groupRoutes from "./routes/groups.js";
import settingsRoutes from "./routes/settings.js";
import libraryRoutes from "./routes/library.js";
import { seedLibraryIfEmpty } from "./db/seed-library.js";
import { generatePaperQueue } from "./queue/generate-paper.queue.js";
import { AssignmentModel } from "./models/assignment.js";

const app = express();
const server = http.createServer(app);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, "../uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Build allowed origins list from CORS_ORIGIN (supports comma-separated values)
const allowedOrigins = env.CORS_ORIGIN
  .split(",")
  .map((o) => {
    let val = o.trim();
    if (val.endsWith("/")) {
      val = val.slice(0, -1);
    }
    return val;
  })
  .filter(Boolean);

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return true; // Allow server-to-server or same-origin requests
  const lowercaseOrigin = origin.toLowerCase();
  if (lowercaseOrigin.startsWith("http://localhost:") || lowercaseOrigin.startsWith("https://localhost:")) return true;
  if (lowercaseOrigin.endsWith(".railway.app") || lowercaseOrigin.includes("railway.app")) return true;
  return allowedOrigins.includes(origin);
}

const io = new SocketIOServer(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, isOriginAllowed(origin));
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const isProd = process.env.NODE_ENV === "production";

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProd ? 500 : 10000, // Production: 500 requests per 15 min window; dev: relaxed
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many requests from this IP, please try again after 15 minutes",
  },
});

const creationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: isProd ? 10 : 1000, // Relaxed creation limit in local development/testing
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: "Too many paper generations requested, please try again in a minute",
  },
});

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, isOriginAllowed(origin));
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(globalLimiter);
app.use(
  "/uploads",
  (req, res, next) => {
    res.removeHeader("X-Frame-Options");
    res.removeHeader("Content-Security-Policy");
    next();
  },
  express.static(uploadDir)
);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/debug-queue", async (req, res, next) => {
  try {
    const assignments = await AssignmentModel.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const jobs = await generatePaperQueue.getJobs([
      "active",
      "waiting",
      "completed",
      "failed",
      "delayed",
    ]);

    const jobsInfo = await Promise.all(
      jobs.map(async (job) => {
        const state = await job.getState();
        return {
          id: job.id,
          name: job.name,
          data: job.data,
          state,
          progress: job.progress,
          failedReason: job.failedReason,
          timestamp: job.timestamp,
        };
      })
    );

    res.json({
      success: true,
      assignments,
      jobs: jobsInfo,
    });
  } catch (err) {
    next(err);
  }
});

app.use("/api/assignments/:id/regenerate", creationLimiter);
app.use("/api/assignments", (req, res, next) => {
  if (req.method === "POST") {
    return creationLimiter(req, res, next);
  }
  next();
});

app.use("/api/assignments", assignmentRoutes);
app.use("/api/papers", paperRoutes);
app.use("/api/toolkit", (req, res, next) => {
  if (req.method === "POST") {
    return creationLimiter(req, res, next);
  }
  next();
});
app.use("/api/toolkit", toolkitRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/library", libraryRoutes);

app.use(errorHandler);

async function start(): Promise<void> {
  await connectDB();
  await seedLibraryIfEmpty();
  setupSocket(io);
  initWorker(io);

  // Koyeb and other PaaS providers require binding to 0.0.0.0
  server.listen(env.PORT, "0.0.0.0", () => {
    console.log(`VedaAI API server running on port ${env.PORT} (${isProd ? "production" : "development"})`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
