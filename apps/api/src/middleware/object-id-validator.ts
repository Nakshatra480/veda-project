import { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

export function validateObjectId(paramName: string = "id") {
  return (req: Request, res: Response, next: NextFunction): void => {
    const id = req.params[paramName];
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        error: `Invalid ID format for parameter: ${paramName}`,
      });
      return;
    }
    next();
  };
}
