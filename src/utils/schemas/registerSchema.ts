import { z } from 'zod';

import type { TranslateFunction } from '@/types/i18n';

import { passwordRules } from '@/constants/password';

export const createRegisterSchema = (t: TranslateFunction) =>
  z
    .object({
      email: z.string().min(1, t('validation.email.required')).email(t('validation.email.invalid')),
      password: z
        .string()
        .min(passwordRules.min, t('validation.password.min', { min: passwordRules.min }))
        .regex(passwordRules.hasUpperCase, t('validation.password.uppercase'))
        .regex(passwordRules.hasSpecialChar, t('validation.password.special'))
        .regex(passwordRules.hasAlphaNumeric, t('validation.password.alphanumeric')),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('validation.password.mismatch'),
      path: ['confirmPassword'],
    });

export type RegisterSchema = z.infer<ReturnType<typeof createRegisterSchema>>;
