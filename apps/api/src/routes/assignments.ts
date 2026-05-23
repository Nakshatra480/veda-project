import { Router, Request, Response, NextFunction } from "express";
import { CreateAssignmentSchema, ListAssignmentsQuerySchema, ASSIGNMENT_STATUS } from "@vedaai/shared";
import { AssignmentModel } from "../models/assignment.js";
import { QuestionPaperModel } from "../models/question-paper.js";
import { generatePaperQueue } from "../queue/generate-paper.queue.js";
import { validate } from "../middleware/validate.js";
import { validateObjectId } from "../middleware/object-id-validator.js";

const router = Router();

router.post(
  "/",
  validate(CreateAssignmentSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const assignment = await AssignmentModel.create(req.body);

      await generatePaperQueue.add(
        "generate",
        { assignmentId: assignment._id.toString() },
        { jobId: `assignment-${assignment._id.toString()}` }
      );

      res.status(201).json({
        success: true,
        data: assignment.toJSON(),
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/",
  validate(ListAssignmentsQuerySchema, "query"),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search, status, page, limit } = req.validatedQuery;

      const filter: Record<string, unknown> = {};

      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: "i" } },
          { subject: { $regex: search, $options: "i" } },
        ];
      }

      if (status) {
        filter.status = status;
      }

      const skip = (page - 1) * limit;

      const [items, total] = await Promise.all([
        AssignmentModel.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        AssignmentModel.countDocuments(filter),
      ]);

      res.json({
        success: true,
        data: {
          items,
          total,
          page,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

router.get("/:id", validateObjectId(), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignment = await AssignmentModel.findById(req.params.id).lean();

    if (!assignment) {
      res.status(404).json({
        success: false,
        error: "Assignment not found",
      });
      return;
    }

    res.json({
      success: true,
      data: assignment,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/:id/regenerate", validateObjectId(), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignment = await AssignmentModel.findById(req.params.id);

    if (!assignment) {
      res.status(404).json({
        success: false,
        error: "Assignment not found",
      });
      return;
    }

    if (assignment.generatedPaperId) {
      await QuestionPaperModel.findByIdAndDelete(assignment.generatedPaperId);
    }

    // Use $unset to properly remove fields from MongoDB — assigning undefined inside
    // Mongoose .save() does NOT delete existing stored field values.
    await AssignmentModel.updateOne(
      { _id: assignment._id },
      {
        $set: { status: ASSIGNMENT_STATUS.PENDING },
        $unset: { generatedPaperId: "", errorMessage: "" },
      }
    );

    const updatedAssignment = await AssignmentModel.findById(assignment._id).lean();

    const jobId = `assignment-${assignment._id.toString()}`;
    const existingJob = await generatePaperQueue.getJob(jobId);
    if (existingJob) {
      const state = await existingJob.getState();
      if (state === "completed" || state === "failed") {
        await existingJob.remove();
      }
    }

    // jobId deduplication: prevents a second job from being enqueued while one is
    // already waiting in the queue for the same assignment.
    await generatePaperQueue.add(
      "generate",
      { assignmentId: assignment._id.toString() },
      { jobId }
    );

    res.json({
      success: true,
      data: updatedAssignment,
    });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", validateObjectId(), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const assignment = await AssignmentModel.findById(req.params.id);
    if (!assignment) {
      res.status(404).json({
        success: false,
        error: "Assignment not found",
      });
      return;
    }
    if (assignment.generatedPaperId) {
      await QuestionPaperModel.findByIdAndDelete(assignment.generatedPaperId);
    }
    await AssignmentModel.findByIdAndDelete(req.params.id);
    res.json({
      success: true,
      data: { id: req.params.id },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
