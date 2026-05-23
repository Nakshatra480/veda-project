import IORedis from "ioredis";
import { env } from "../config/env.js";

const isTls = env.REDIS_URL.startsWith("rediss://");

export const redisConnection = new IORedis(env.REDIS_URL, {
  maxRetriesPerRequest: null,
  tls: isTls ? { rejectUnauthorized: false } : undefined,
});

redisConnection.on("error", (err) => {
  console.error("Redis connection error:", err);
});

redisConnection.on("connect", () => {
  console.log("Redis connected successfully to: " + env.REDIS_URL.split("@")[1] || env.REDIS_URL);
});
