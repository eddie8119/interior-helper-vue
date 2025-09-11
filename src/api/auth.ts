import type { AuthResponse } from '@/api/response';
import type { ApiResponse } from '@/types/request';
import type { LoginSchema } from '@/utils/schemas/loginSchema';

import request from '@/utils/request';

export const authApi = {
  login: (data: LoginSchema): Promise<ApiResponse<AuthResponse>> => {
    return request.post('/auth/login/', data);
  },
  logout: (data: { refreshToken: string }): Promise<ApiResponse<AuthResponse>> => {
    return request.post('/auth/logout/', data);
  },
};
