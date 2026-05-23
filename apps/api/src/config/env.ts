interface EnvConfig {
  MONGODB_URI: string;
  REDIS_URL: string;
  OPENROUTER_API_KEY: string;
  OPENROUTER_MODEL: string;
  PORT: number;
  CORS_ORIGIN: string;
}

function loadEnv(): EnvConfig {
  const nodeEnv = process.env.NODE_ENV || "development";
  const apiKey = process.env.OPENROUTER_API_KEY || "";

  if (nodeEnv === "production" && !apiKey) {
    throw new Error("OPENROUTER_API_KEY is required in production");
  }

  return {
    MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/vedaai",
    REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
    OPENROUTER_API_KEY: apiKey,
    OPENROUTER_MODEL: process.env.OPENROUTER_MODEL || "minimax/minimax-m2.5",
    PORT: parseInt(process.env.PORT || "4000", 10),
    CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:3000",
  };
}

export const env = loadEnv();
