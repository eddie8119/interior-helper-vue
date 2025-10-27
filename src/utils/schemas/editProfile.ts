import { z } from 'zod';

import type { TranslateFunction } from '@/types/i18n';

export const editProfileSchema = (t: TranslateFunction) =>
  z.object({
    name: z.string().min(1, t('validation.name_required')),
    phone: z.string().min(1, t('validation.phone_required')),
    company: z.string().min(1, t('validation.company_required')),
  });

export type EditProfileSchema = z.infer<ReturnType<typeof editProfileSchema>>;
