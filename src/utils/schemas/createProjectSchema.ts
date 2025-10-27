import { z } from 'zod';

import type { TranslateFunction } from '@/types/i18n';

import { constructionSelectionSchema } from './createCommonSchema';
import { PROJECT_TYPE_VALUES } from '@/constants/selection';

export const createProjectSchema = (t: TranslateFunction) =>
  z.object({
    title: z
      .string()
      .min(1, t('validation.title.required'))
      .max(10, t('validation.title.max_length')),
    type: z.enum(PROJECT_TYPE_VALUES),
    constructionContainer: z
      .array(constructionSelectionSchema)
      .min(1, t('validation.construction_required')),
  });

export const createProjectDetailSchema = (t: TranslateFunction) =>
  createProjectSchema(t).extend({
    startDate: z.date().nullable().optional(),
    dueDate: z.date().nullable().optional(),
    budgetTotal: z.number().nullable().optional().default(0),
    costTotal: z.number().nullable().optional().default(0),
    progress: z.number().optional().default(0),
    containers: z.array(z.any()).optional(),
    team: z.array(z.any()).optional(),
  });

export type CreateProjectSchema = z.infer<ReturnType<typeof createProjectSchema>>;
export type CreateProjectDetailSchema = z.infer<ReturnType<typeof createProjectDetailSchema>>;
