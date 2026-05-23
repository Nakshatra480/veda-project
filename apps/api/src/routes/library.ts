import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { LibraryResourceModel } from "../models/library-resource.js";
import { validate } from "../middleware/validate.js";
import { validateObjectId } from "../middleware/object-id-validator.js";
import { upload } from "../middleware/upload.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, "../../uploads");

const router = Router();

// ─── Validation Schemas ──────────────────────────────────────────────────────

const CreateResourceSchema = z.object({
  title: z.string().min(1).max(300).trim(),
  type: z.enum(["document", "video", "link", "book"]),
  subject: z.string().min(1).max(100).trim(),
  grade: z.string().min(1).max(20).trim(),
  description: z.string().min(1).max(1000).trim(),
  url: z.string().url().optional().or(z.literal("")),
  size: z.string().max(20).trim().optional(),
  duration: z.string().max(30).trim().optional(),
  tags: z.array(z.string().min(1).max(50).trim()).max(10).default([]),
});

const UpdateResourceSchema = z.object({
  title: z.string().min(1).max(300).trim().optional(),
  type: z.enum(["document", "video", "link", "book"]).optional(),
  subject: z.string().min(1).max(100).trim().optional(),
  grade: z.string().min(1).max(20).trim().optional(),
  description: z.string().min(1).max(1000).trim().optional(),
  url: z.string().url().optional().or(z.literal("")),
  size: z.string().max(20).trim().optional(),
  duration: z.string().max(30).trim().optional(),
  tags: z.array(z.string().min(1).max(50).trim()).max(10).optional(),
  starred: z.boolean().optional(),
});

const ListResourcesQuerySchema = z.object({
  search: z.string().optional(),
  type: z.enum(["document", "video", "link", "book"]).optional(),
  subject: z.string().optional(),
  grade: z.string().optional(),
  starred: z.coerce.boolean().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

// ─── GET /api/library ─────────────────────────────────────────────────────────

router.get(
  "/",
  validate(ListResourcesQuerySchema, "query"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search, type, subject, grade, starred, page, limit } =
        req.validatedQuery;

      const filter: Record<string, unknown> = {};

      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { subject: { $regex: search, $options: "i" } },
          { tags: { $elemMatch: { $regex: search, $options: "i" } } },
        ];
      }

      if (type) filter.type = type;
      if (subject) filter.subject = { $regex: subject, $options: "i" };
      if (grade) filter.grade = grade;
      if (starred !== undefined) filter.starred = starred;

      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        LibraryResourceModel.find(filter)
          .sort({ starred: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        LibraryResourceModel.countDocuments(filter),
      ]);

      const [allStarred, subjectList] = await Promise.all([
        LibraryResourceModel.countDocuments({ starred: true }),
        LibraryResourceModel.distinct("subject"),
      ]);
      const totalAll = await LibraryResourceModel.countDocuments({});

      res.json({
        success: true,
        data: {
          items,
          total,
          page,
          totalPages: Math.ceil(total / limit),
          stats: {
            total: totalAll,
            starred: allStarred,
            subjects: subjectList.length,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/library/:id ─────────────────────────────────────────────────────

router.get(
  "/:id",
  validateObjectId(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resource = await LibraryResourceModel.findById(req.params.id).lean();
      if (!resource) {
        res.status(404).json({ success: false, error: "Resource not found" });
        return;
      }
      res.json({ success: true, data: resource });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/library/:id/download ────────────────────────────────────────────

router.get(
  "/:id/download",
  validateObjectId(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resource = await LibraryResourceModel.findById(req.params.id);
      if (!resource) {
        res.status(404).json({ success: false, error: "Resource not found" });
        return;
      }

      if (resource.fileKey) {
        const absolutePath = path.join(uploadDir, resource.fileKey);
        if (fs.existsSync(absolutePath)) {
          // Send file with Content-Disposition headers for direct download
          res.download(absolutePath, resource.fileName || "download");
          return;
        }
      }

      // If no file exists but url exists (e.g. links or pre-seeded absolute URLs), redirect
      if (resource.url) {
        res.redirect(resource.url);
        return;
      }

      res.status(400).json({ success: false, error: "No download URL or file available for this resource" });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/library ────────────────────────────────────────────────────────

router.post(
  "/",
  upload.single("file"),
  (req: Request, res: Response, next: NextFunction) => {
    if (req.body && typeof req.body.tags === "string") {
      try {
        req.body.tags = JSON.parse(req.body.tags);
      } catch {
        req.body.tags = req.body.tags
          .split(",")
          .map((t: string) => t.trim())
          .filter(Boolean);
      }
    }
    next();
  },
  validate(CreateResourceSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = { ...req.body };

      if (req.file) {
        data.fileKey = req.file.filename;
        data.fileName = req.file.originalname;
        data.mimeType = req.file.mimetype;
        data.url = `/uploads/${req.file.filename}`;

        if (!data.size) {
          const bytes = req.file.size;
          if (bytes >= 1024 * 1024) {
            data.size = `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
          } else {
            data.size = `${(bytes / 1024).toFixed(0)} KB`;
          }
        }
      }

      const resource = await LibraryResourceModel.create(data);
      res.status(201).json({ success: true, data: resource.toJSON() });
    } catch (err) {
      next(err);
    }
  }
);

// ─── PATCH /api/library/:id ───────────────────────────────────────────────────

router.patch(
  "/:id",
  validateObjectId(),
  validate(UpdateResourceSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resource = await LibraryResourceModel.findByIdAndUpdate(
        req.params.id,
        { $set: req.body },
        { new: true, runValidators: true }
      ).lean();

      if (!resource) {
        res.status(404).json({ success: false, error: "Resource not found" });
        return;
      }

      res.json({ success: true, data: resource });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/library/:id ──────────────────────────────────────────────────

router.delete(
  "/:id",
  validateObjectId(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const resource = await LibraryResourceModel.findByIdAndDelete(req.params.id);
      if (!resource) {
        res.status(404).json({ success: false, error: "Resource not found" });
        return;
      }

      if (resource.fileKey) {
        const absolutePath = path.join(uploadDir, resource.fileKey);
        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
        }
      }

      res.json({ success: true, message: "Resource deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
