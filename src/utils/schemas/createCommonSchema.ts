import { z } from 'zod';

export const createCommonSchema = z.object({
  construction: z.string().min(1, '施工項目為必填'),
  unit: z.string().min(1, '單位為必填'),
});

export type CreateCommonSchema = z.infer<typeof createCommonSchema>;
