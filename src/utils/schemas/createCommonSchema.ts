import { z } from 'zod';

export const createCommonSchema = z.object({
  construction: z.array(z.string()).min(1, '工程項目為必填'),
  unit: z.array(z.string()).min(1, '單位為必填'),
});

export type CreateCommonSchema = z.infer<typeof createCommonSchema>;
