import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, '任務名稱為必填'),
  description: z.string().min(1, '任務描述為必填'),
  reminderDatetime: z.date().optional(),
  materials: z
    .array(
      z
        .object({
          name: z.string(),
          quantity: z.number().optional(),
          unitPrice: z.number().optional(),
        })
        .superRefine((data, ctx) => {
          // Only validate quantity and unitPrice if a material name has been entered.
          if (data.name && data.name.trim() !== '') {
            // If quantity has a value, it must be a positive number.
            if (data.quantity !== undefined && data.quantity !== null && data.quantity <= 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: '數量必須大於 0',
                path: ['quantity'],
              });
            }
            // If unitPrice has a value, it must not be negative.
            if (data.unitPrice !== undefined && data.unitPrice !== null && data.unitPrice < 0) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: '單價不能為負數',
                path: ['unitPrice'],
              });
            }
          }
        })
    )
    .optional(),
  constructionType: z.string(),
  projectId: z.string(),
  status: z.enum(['todo', 'inProgress', 'done']).optional(),
});

export type CreateTaskSchema = z.infer<typeof createTaskSchema>;
