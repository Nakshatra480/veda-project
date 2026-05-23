import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";

export function validate(schema: ZodSchema, source: "body" | "query" = "body") {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: result.error.errors.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      });
      return;
    }

    if (source === "body") {
      req.body = result.data;
    } else {
      req.validatedQuery = result.data;
    }

    next();
  };
}

declare global {
  namespace Express {
    interface Request {
      validatedQuery?: any;
    }
  }
}
