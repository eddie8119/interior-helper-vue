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

interface ChangePasswordPayload {
  old_password: string;
  new_password: string;
  new_confirm_password: string;
}

interface ResetPasswordPayload {
  new_password: string;
  new_confirm_password: string;
  token: string;
  uid: string;
}

export const usersApi = {
  // User account operations
  // 註冊
  register(data: RegisterData) {
    return request.post('/users/', data);
  },

  // 帳戶激活
  activateAccount(data: ActivationData) {
    return request.post('/users/activation/', data);
  },

  // 重發激活郵件
  resendActivation(data: ResendActivationData) {
    return request.post('/users/activation/resend/', data);
  },

  // Password management
  // 要求重置密碼
  forgotPassword(data: ForgotPasswordData) {
    return request.post('/users/reset-password/', data);
  },

  // 重置密碼(忘記密碼)
  resetPassword(data: ResetPasswordData) {
    const { newPassword, newConfirmPassword, token, uid } = data;

    const payload: ResetPasswordPayload = {
      new_password: newPassword,
      new_confirm_password: newConfirmPassword,
      token,
      uid,
    };

    return request.patch('/users/reset-password/confirm/', payload);
  },

  // 更改密碼(知道密碼)
  changePassword(data: ChangePasswordData) {
    const { oldPassword, newPassword, newConfirmPassword } = data;

    const payload: ChangePasswordPayload = {
      old_password: oldPassword,
      new_password: newPassword,
      new_confirm_password: newConfirmPassword,
    };

    return request.put('/users/change-password/', payload);
  },

  // Profile management
  // 取得個人資料
  getUserProfile() {
    return request.get('/users/profile/');
  },

  // 更新個人資料
  updateUserProfile(data: EditProfileData) {
    return request.put('/users/profile/', data);
  },
};
