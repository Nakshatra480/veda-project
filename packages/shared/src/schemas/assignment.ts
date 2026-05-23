import { z } from "zod";

export const QuestionConfigSchema = z.object({
  type: z.enum(["mcq", "short_answer", "long_answer", "true_false", "fill_in_blank"]),
  count: z.number().int().min(1).max(50),
  marksPerQuestion: z.number().int().min(1).max(20),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
});

export const CreateAssignmentSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  subject: z.string().min(1, "Subject is required"),
  grade: z.string().min(1, "Grade is required"),
  dueDate: z.string().optional(),
  instructions: z.string().max(2000).optional(),
  questionConfig: z.array(QuestionConfigSchema).min(1, "At least one question type is required"),
  sourceFileName: z.string().optional(),
  sourceFileContent: z.string().max(60000).optional(),
});

export const AssignmentSchema = z.object({
  _id: z.string(),
  title: z.string(),
  subject: z.string(),
  grade: z.string(),
  dueDate: z.string().optional(),
  instructions: z.string().optional(),
  questionConfig: z.array(QuestionConfigSchema),
  sourceFileName: z.string().optional(),
  status: z.enum(["pending", "processing", "done", "failed"]),
  generatedPaperId: z.string().optional(),
  errorMessage: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type QuestionConfig = z.infer<typeof QuestionConfigSchema>;
export type CreateAssignmentInput = z.infer<typeof CreateAssignmentSchema>;
export type Assignment = z.infer<typeof AssignmentSchema>;
