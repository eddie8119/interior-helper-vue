import type { ApiResponse } from '@/types/request';
import type {
  ActivationData,
  ChangePasswordData,
  EditProfileData,
  ForgotPasswordData,
  RegisterData,
  ResendActivationData,
  ResetPasswordData,
} from '@/types/user';

import request from '@/utils/request';

export const userApi = {
  // 註冊
  register(data: RegisterData): Promise<ApiResponse<null>> {
    return request.post('/user/register/', data);
  },

  // 帳戶激活
  activateAccount(data: ActivationData) {
    return request.post('/user/activation/', data);
  },

  // 重發激活郵件
  resendActivation(data: ResendActivationData) {
    return request.post('/user/activation/resend/', data);
  },

  // Password management
  // 要求重置密碼
  forgotPassword(data: ForgotPasswordData) {
    return request.post('/user/reset-password/', data);
  },

  // 重置密碼(忘記密碼)
  resetPassword(payload: ResetPasswordData) {
    return request.patch('/user/reset-password/confirm/', payload);
  },

  // 更改密碼(知道密碼)
  changePassword(payload: ChangePasswordData) {
    return request.put('/user/change-password/', payload);
  },

  // Profile management
  // 取得個人資料
  getUserProfile() {
    return request.get('/user/profile');
  },

  // 更新個人資料
  updateUserProfile(data: EditProfileData) {
    return request.put('/user/profile', data);
  },
};
