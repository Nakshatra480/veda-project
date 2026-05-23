import { z } from "zod";

export const QuestionSchema = z.object({
  questionNumber: z.number().int().min(1),
  text: z.string().min(1),
  type: z.enum(["mcq", "short_answer", "long_answer", "true_false", "fill_in_blank"]),
  difficulty: z.enum(["easy", "medium", "hard"]),
  marks: z.number().int().min(1),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1),
});

export const SectionSchema = z.object({
  label: z.string().min(1),
  title: z.string().min(1),
  instruction: z.string(),
  questions: z.array(QuestionSchema).min(1),
});

export const QuestionPaperSchema = z.object({
  _id: z.string(),
  assignmentId: z.string(),
  title: z.string(),
  subject: z.string(),
  grade: z.string(),
  totalMarks: z.number().int().min(1),
  duration: z.string().optional(),
  generalInstructions: z.array(z.string()).optional(),
  sections: z.array(SectionSchema).min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const GeneratedPaperResponseSchema = z.object({
  title: z.string(),
  subject: z.string(),
  grade: z.string(),
  totalMarks: z.number(),
  duration: z.string().optional(),
  generalInstructions: z.array(z.string()).optional(),
  sections: z.array(
    z.object({
      label: z.string(),
      title: z.string(),
      instruction: z.string(),
      questions: z.array(
        z.object({
          questionNumber: z.number(),
          text: z.string(),
          type: z.enum(["mcq", "short_answer", "long_answer", "true_false", "fill_in_blank"]),
          difficulty: z.enum(["easy", "medium", "hard"]),
          marks: z.number(),
          options: z.array(z.string()).optional(),
          correctAnswer: z.string().min(1),
        })
      ),
    })
  ),
});

export type Question = z.infer<typeof QuestionSchema>;
export type Section = z.infer<typeof SectionSchema>;
export type QuestionPaper = z.infer<typeof QuestionPaperSchema>;
export type GeneratedPaperResponse = z.infer<typeof GeneratedPaperResponseSchema>;
