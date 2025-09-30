import { z } from 'zod';

import type { ConstructionSelection } from '@/types/selection';

const constructionSelectionSchema = z.object({
  id: z.number(),
  name: z.string()
});

export const createCommonSchema = z.object({
  construction: z.array(constructionSelectionSchema).min(1, '工程項目為必填'),
  unit: z.array(z.string()).min(1, '單位為必填'),
  projectType: z.array(z.string()).min(1, '案件類別為必填'),
});

export type CreateCommonSchema = z.infer<typeof createCommonSchema>;
