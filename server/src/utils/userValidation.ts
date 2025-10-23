import { randomBytes } from 'crypto';

import { supabase } from '@/lib/supabase';

/**
 * 從 action link 中提取 token
 */
export const extractTokenFromActionLink = (actionLink: string): string | null => {
  try {
    const url = new URL(actionLink);
    return url.searchParams.get('token');
  } catch {
    return null;
  }
};

/**
 * 回滾用戶註冊（刪除 auth user 和 profile）
 */
export const rollbackUserRegistration = async (userId: string): Promise<void> => {
  await Promise.all([
    supabase.auth.admin.deleteUser(userId),
    supabase.from('Profiles').delete().eq('id', userId),
  ]);
};

/**
 * 驗證密碼變更
 */
export const validatePasswordChange = (
  newPassword: string,
  confirmPassword: string
): { valid: boolean; error?: string } => {
  if (!newPassword || !confirmPassword) {
    return { valid: false, error: 'New password and confirm password are required' };
  }
  if (newPassword !== confirmPassword) {
    return { valid: false, error: 'Passwords do not match' };
  }
  if (newPassword.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters long' };
  }
  return { valid: true };
};

/**
 * 驗證用戶註冊輸入
 */
export const validateRegistrationInput = (
  email: string,
  password: string,
  name: string
): { valid: boolean; error?: string } => {
  if (!email || !password || !name) {
    return { valid: false, error: 'Email, password, and name are required' };
  }
  if (!email.includes('@')) {
    return { valid: false, error: 'Invalid email format' };
  }
  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters long' };
  }
  return { valid: true };
};

/**
 * 生成安全的隨機密碼
 */
export const generateSecureRandomPassword = (): string => {
  return randomBytes(16).toString('hex');
};
