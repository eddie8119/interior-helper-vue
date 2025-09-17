import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, '任務名稱為必填'),
  description: z.string().min(1, '任務描述為必填'),
  reminderDatetime: z.date().optional(),
  materials: z
    .array(
      z.object({
        name: z.string().min(1, '材料品項不能為空'),
        quantity: z
          .number({
            invalid_type_error: '數量必須是數字',
          })
          .positive('數量必須大於 0'),
        unitPrice: z
          .number({
            invalid_type_error: '單價必須是數字',
          })
          .positive('單價必須大於 0'),
      })
    )
    .optional(),
  type: z.string(),
  projectId: z.string(),
});

export type CreateTaskSchema = z.infer<typeof createTaskSchema>;
