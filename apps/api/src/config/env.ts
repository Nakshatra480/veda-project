interface EnvConfig {
  MONGODB_URI: string;
  REDIS_URL: string;
  OPENROUTER_API_KEY: string;
  OPENROUTER_MODEL: string;
  PORT: number;
  CORS_ORIGIN: string;
}

function cleanRedisUrl(url: string | undefined): string {
  if (!url) return "redis://localhost:6379";
  let cleaned = url.trim();

  // Strip 'redis-cli --tls -u ' or 'redis-cli -u ' if the user copied the command line utility string
  const cliPrefixRegex = /^redis-cli\s+(--tls\s+)?-u\s+/i;
  cleaned = cleaned.replace(cliPrefixRegex, "");

  // If the user's connection string starts with 'redis://' but points to Upstash,
  // Upstash ALWAYS requires TLS in production, so we should map it to 'rediss://'
  if (cleaned.startsWith("redis://") && cleaned.includes("upstash.io")) {
    cleaned = cleaned.replace(/^redis:\/\//i, "rediss://");
  }

  return cleaned;
}

function loadEnv(): EnvConfig {
  const nodeEnv = process.env.NODE_ENV || "development";
  const apiKey = process.env.OPENROUTER_API_KEY || "";

  if (nodeEnv === "production" && !apiKey) {
    throw new Error("OPENROUTER_API_KEY is required in production");
  }

  return {
    MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/vedaai",
    REDIS_URL: cleanRedisUrl(process.env.REDIS_URL),
    OPENROUTER_API_KEY: apiKey,
    OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || "minimax/minimax-m2.5",
    PORT: parseInt(process.env.PORT || "4000", 10),
    CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  };
}

export const env = loadEnv();
