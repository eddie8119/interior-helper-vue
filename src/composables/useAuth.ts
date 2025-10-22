import { useMutation } from '@tanstack/vue-query';
import { type Ref, ref } from 'vue';

import type { ApiResponse } from '@/types/request';
import type { AuthResponse } from '@/types/response';
import type { LoginData } from '@/types/user';

import { authApi } from '@/api/auth';

interface UseAuthReturn {
  // 登入
  login: (data: LoginData) => Promise<ApiResponse<AuthResponse>>;
  isLoggingIn: Ref<boolean>;
  loginError: Ref<Error | null>;
}

export function useAuth(): UseAuthReturn {
  // 狀態追蹤
  const isLoggingIn = ref(false);
  const loginError = ref<Error | null>(null);

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
      return { success: false, message: '登入失敗' };
    } finally {
      isLoggingIn.value = false;
    }
  };

  return {
    // 登入
    login,
    isLoggingIn,
    loginError,
  };
}
