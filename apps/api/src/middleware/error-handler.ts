import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: "Validation failed",
      details: err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
    return;
  }

  if (err.name === "CastError") {
    res.status(400).json({
      success: false,
      error: "Invalid ID format",
    });
    return;
  }

  console.error("Unhandled error:", err);

  const statusCode = (err as any).statusCode || 500;
  const isProd = process.env.NODE_ENV === "production";

  res.status(statusCode).json({
    success: false,
    error: isProd && statusCode === 500 ? "Internal server error" : (err.message || "Internal server error"),
  });
}
