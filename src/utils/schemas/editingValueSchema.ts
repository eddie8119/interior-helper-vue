import { z } from 'zod';

import type { TranslateFunction } from '@/types/i18n';

export const createEditingValueSchema = (t: TranslateFunction) =>
  z.object({
    editingValue: z.string().min(1, t('validation.input.required')),
  });

export type EditingValueSchema = z.infer<ReturnType<typeof createEditingValueSchema>>;
