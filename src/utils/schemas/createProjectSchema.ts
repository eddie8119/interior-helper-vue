import { z } from 'zod';

// const constructionSelectionSchema = z.object({
//   type: z.string(),
//   order: z.number(),
// });

export const createProjectSchema = z.object({
  title: z.string().min(1, '請輸入專案標題').max(10, '標題不能超過10個字'),
  type: z.enum(['residential', 'luxury', 'commercial', 'office']),
  constructionContainer: z.array(z.string()).min(1, '至少選擇一個施工項目'),
});

export const createProjectDetailSchema = createProjectSchema.extend({
  startDate: z.date().nullable().optional(),
  dueDate: z.date().nullable().optional(),
  budgetTotal: z.number().nullable().optional().default(0),
  costTotal: z.number().nullable().optional().default(0),
  progress: z.number().optional().default(0),
  containers: z.array(z.any()).optional(),
  team: z.array(z.any()).optional(),
});

export type CreateProjectSchema = z.infer<typeof createProjectSchema>;
export type CreateProjectDetailSchema = z.infer<typeof createProjectDetailSchema>;
