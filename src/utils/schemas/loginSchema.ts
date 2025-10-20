import { z } from 'zod';

import { passwordRules } from '@/constants/password';
import type { TranslateFunction } from '@/types/i18n';

export const createLoginSchema = (t: TranslateFunction) =>
  z.object({
    email: z.string().min(1, t('validation.email.required')).email(t('validation.email.invalid')),
    // Login 僅檢查最小長度，避免對既有密碼的複雜度造成限制
    password: z
      .string()
      .min(passwordRules.min, t('validation.password.min', { min: passwordRules.min }))
      .regex(passwordRules.hasUpperCase, t('validation.password.uppercase'))
      .regex(passwordRules.hasSpecialChar, t('validation.password.special'))
      .regex(passwordRules.hasAlphaNumeric, t('validation.password.alphanumeric')),
  });

export type LoginSchema = z.infer<ReturnType<typeof createLoginSchema>>;
