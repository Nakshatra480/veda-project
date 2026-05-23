import { z } from "zod";

export const ListAssignmentsQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(["pending", "processing", "done", "failed"]).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const ApiSuccessResponse = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    data: dataSchema,
  });

export const ApiErrorResponse = z.object({
  success: z.literal(false),
  error: z.string(),
  details: z.unknown().optional(),
});

export const PaginatedResponse = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number(),
    page: z.number(),
    totalPages: z.number(),
  });

export type ListAssignmentsQuery = z.infer<typeof ListAssignmentsQuerySchema>;
