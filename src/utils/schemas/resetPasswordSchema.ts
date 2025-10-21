import { z } from 'zod';

import type { TranslateFunction } from '@/types/i18n';

import { passwordRules } from '@/constants/password';

export const createResetPasswordSchema = (t: TranslateFunction) =>
  z
    .object({
      newPassword: z
        .string()
        .min(passwordRules.min, t('validation.password.min', { min: passwordRules.min }))
        .regex(passwordRules.hasUpperCase, t('validation.password.uppercase'))
        .regex(passwordRules.hasSpecialChar, t('validation.password.special'))
        .regex(passwordRules.hasAlphaNumeric, t('validation.password.alphanumeric')),
      newConfirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.newConfirmPassword, {
      message: t('validation.password.mismatch'),
      path: ['newConfirmPassword'],
    });

export type ResetPasswordSchema = z.infer<ReturnType<typeof createResetPasswordSchema>>;
