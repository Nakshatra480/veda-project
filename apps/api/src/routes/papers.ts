import { Router, Request, Response, NextFunction } from "express";
import { QuestionPaperModel } from "../models/question-paper.js";
import { generatePdf } from "../services/pdf-service.js";
import { validateObjectId } from "../middleware/object-id-validator.js";

const router = Router();

router.get("/:id", validateObjectId(), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const paper = await QuestionPaperModel.findById(req.params.id).lean();

    if (!paper) {
      res.status(404).json({
        success: false,
        error: "Question paper not found",
      });
      return;
    }

    // Strip the correctAnswer field from all questions to prevent student cheating
    if (paper.sections) {
      paper.sections.forEach((section: any) => {
        if (section.questions) {
          section.questions.forEach((question: any) => {
            delete question.correctAnswer;
          });
        }
      });
    }

    res.json({
      success: true,
      data: paper,
    });
  } catch (err) {
    next(err);
  }
});

router.get("/:id/pdf", validateObjectId(), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const paper = await QuestionPaperModel.findById(req.params.id);

    if (!paper) {
      res.status(404).json({
        success: false,
        error: "Question paper not found",
      });
      return;
    }

    const pdfBuffer = await generatePdf(paper);

    const sanitizedTitle = paper.title.replace(/[^a-zA-Z0-9\s-]/g, "").replace(/\s+/g, "_");

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${sanitizedTitle}.pdf"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.send(pdfBuffer);
  } catch (err) {
    next(err);
  }
});

export default router;
