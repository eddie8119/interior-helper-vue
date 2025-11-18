import { useMutation } from '@tanstack/vue-query';
import { type Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { SsoProvider } from '@/constants/provider';
import type { ApiResponse } from '@/types/request';
import type { AuthResponse } from '@/types/response';
import type { LoginData } from '@/types/user';

import { authApi } from '@/api/auth';

interface UseAuthReturn {
  // 登入
  login: (data: LoginData) => Promise<ApiResponse<AuthResponse>>;
  isLoggingIn: Ref<boolean>;
  loginError: Ref<Error | null>;
  // SSO 登入
  ssoLogin: (provider: SsoProvider) => Promise<void>;
  isSsoLoggingIn: Ref<boolean>;
  ssoError: Ref<Error | null>;
}

export function useAuth(): UseAuthReturn {
  const { t } = useI18n();
  // 狀態追蹤
  const isLoggingIn = ref(false);
  const loginError = ref<Error | null>(null);
  const isSsoLoggingIn = ref(false);
  const ssoError = ref<Error | null>(null);

  // ==================== 登入 ====================
  const { mutateAsync: mutateLogin } = useMutation({
    mutationFn: async (data: LoginData) => {
      const response = await authApi.login(data);
      return response;
    },
    retry: false, // 不自動重試
  });

  const login = async (data: LoginData): Promise<ApiResponse<AuthResponse>> => {
    try {
      isLoggingIn.value = true;
      loginError.value = null;

      const result = await mutateLogin(data);
      return result as unknown as ApiResponse<AuthResponse>;
    } catch (err: unknown) {
      loginError.value = err instanceof Error ? err : new Error(String(err));
      console.error('登入失敗:', err);
      return { success: false, message: t('message.error.login') };
    } finally {
      isLoggingIn.value = false;
    }
  };

  // ==================== SSO 登入 ====================
  const ssoLogin = async (provider: SsoProvider): Promise<void> => {
    try {
      isSsoLoggingIn.value = true;
      ssoError.value = null;

      const response = await authApi.ssoLogin(provider);
      if (response.success && response.data?.url) {
        // 重定向到 SSO 提供商的授權頁面
        window.location.href = response.data.url;
      } else {
        throw new Error(response.message || 'SSO 登入失敗');
      }
    } catch (err: unknown) {
      ssoError.value = err instanceof Error ? err : new Error(String(err));
      console.error('SSO 登入失敗:', err);
    } finally {
      isSsoLoggingIn.value = false;
    }
  };

  return {
    // 登入
    login,
    isLoggingIn,
    loginError,
    // SSO 登入
    ssoLogin,
    isSsoLoggingIn,
    ssoError,
  };
}
