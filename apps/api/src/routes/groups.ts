import { Router, Request, Response, NextFunction } from "express";
import { z } from "zod";
import { ClassGroupModel } from "../models/class-group.js";
import { validate } from "../middleware/validate.js";
import { validateObjectId } from "../middleware/object-id-validator.js";

const router = Router();

// ─── Validation Schemas ──────────────────────────────────────────────────────

const CreateGroupSchema = z.object({
  name: z.string().min(1).max(100).trim(),
  subject: z.string().min(1).max(100).trim(),
  grade: z.string().min(1).max(20).trim(),
  section: z.string().min(1).max(5).trim(),
  students: z
    .array(z.string().min(1).max(120).trim())
    .max(500)
    .default([]),
});

const ListGroupsQuerySchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

// ─── GET /api/groups ─────────────────────────────────────────────────────────
// List all groups (with optional text search and pagination)

router.get(
  "/",
  validate(ListGroupsQuerySchema, "query"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search, page, limit } = req.validatedQuery;

      const filter: Record<string, unknown> = {};

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: "i" } },
          { subject: { $regex: search, $options: "i" } },
          { grade: { $regex: search, $options: "i" } },
        ];
      }

      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        ClassGroupModel.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        ClassGroupModel.countDocuments(filter),
      ]);

      // Compute aggregate stats
      const allGroups = await ClassGroupModel.find({}).lean();
      const totalStudents = allGroups.reduce((sum, g) => sum + g.students.length, 0);
      const groupsWithScores = allGroups.filter((g) => g.averageScore > 0);
      const overallAvg =
        groupsWithScores.length > 0
          ? parseFloat(
              (
                groupsWithScores.reduce((sum, g) => sum + g.averageScore, 0) /
                groupsWithScores.length
              ).toFixed(1)
            )
          : 0;

      res.json({
        success: true,
        data: {
          items,
          total,
          page,
          totalPages: Math.ceil(total / limit),
          stats: {
            totalGroups: allGroups.length,
            totalStudents,
            overallAvg,
          },
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// ─── GET /api/groups/:id ─────────────────────────────────────────────────────

router.get(
  "/:id",
  validateObjectId(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const group = await ClassGroupModel.findById(req.params.id).lean();

      if (!group) {
        res.status(404).json({ success: false, error: "Group not found" });
        return;
      }

      res.json({ success: true, data: group });
    } catch (err) {
      next(err);
    }
  }
);

// ─── POST /api/groups ────────────────────────────────────────────────────────

router.post(
  "/",
  validate(CreateGroupSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, subject, grade, section, students } = req.body as z.infer<
        typeof CreateGroupSchema
      >;

      // Deduplicate student names (case-insensitive)
      const deduped = Array.from(
        new Map(students.map((s: string) => [s.toLowerCase(), s])).values()
      );

      const group = await ClassGroupModel.create({
        name,
        subject,
        grade,
        section,
        students: deduped,
      });

      res.status(201).json({ success: true, data: group.toJSON() });
    } catch (err: unknown) {
      // MongoDB duplicate key error (same subject+grade+section)
      if ((err as any).code === 11000) {
        res.status(409).json({
          success: false,
          error: `A group for ${req.body.subject} ${req.body.grade} Section ${req.body.section} already exists.`,
        });
        return;
      }
      next(err);
    }
  }
);

// ─── PATCH /api/groups/:id ───────────────────────────────────────────────────
// Update group stats or add/remove students

const UpdateGroupSchema = z.object({
  assignmentsCompleted: z.number().int().min(0).optional(),
  averageScore: z.number().min(0).max(100).optional(),
  students: z.array(z.string().min(1).max(120).trim()).max(500).optional(),
});

router.patch(
  "/:id",
  validateObjectId(),
  validate(UpdateGroupSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updates = req.body as z.infer<typeof UpdateGroupSchema>;

      const group = await ClassGroupModel.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true }
      ).lean();

      if (!group) {
        res.status(404).json({ success: false, error: "Group not found" });
        return;
      }

      res.json({ success: true, data: group });
    } catch (err) {
      next(err);
    }
  }
);

// ─── DELETE /api/groups/:id ──────────────────────────────────────────────────

router.delete(
  "/:id",
  validateObjectId(),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const group = await ClassGroupModel.findByIdAndDelete(req.params.id);

      if (!group) {
        res.status(404).json({ success: false, error: "Group not found" });
        return;
      }

      res.json({ success: true, message: "Group deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
