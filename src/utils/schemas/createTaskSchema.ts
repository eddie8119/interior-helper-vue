import { z } from 'zod';

import type { TranslateFunction } from '@/types/i18n';

export const createTaskSchema = (t: TranslateFunction) =>
  z.object({
    title: z.string().min(1, t('validation.title.required')),
    description: z.string().min(1, t('validation.description_required')),
    materials: z
      .array(
        z
          .object({
            name: z.string(),
            quantity: z.number().optional(),
            unitPrice: z.number().optional(),
            unit: z.string().optional(),
          })
          .superRefine((data, ctx) => {
            // Only validate quantity and unitPrice if a material name has been entered.
            if (data.name && data.name.trim() !== '') {
              // If quantity has a value, it must be a positive number.
              if (data.quantity !== undefined && data.quantity !== null && data.quantity <= 0) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: t('validation.quantity.positive'),
                  path: ['quantity'],
                });
              }
              // If unitPrice has a value, it must not be negative.
              if (data.unitPrice !== undefined && data.unitPrice !== null && data.unitPrice < 0) {
                ctx.addIssue({
                  code: z.ZodIssueCode.custom,
                  message: t('validation.unit_price.negative'),
                  path: ['unitPrice'],
                });
              }
            }
          })
      )
      .optional(),
    constructionType: z.string(),
    projectId: z.string(),
    status: z.enum(['todo', 'inProgress', 'done']),
    reminderDateTime: z.string().optional(),
    endDateTime: z.string().optional(),
    pinLocation: z
      .object({
        floorPlanUrl: z.string().url(),
        xPercent: z.number().min(0).max(100),
        yPercent: z.number().min(0).max(100),
      })
      .optional(),
  });

export type CreateTaskSchema = z.infer<ReturnType<typeof createTaskSchema>>;
