import type { LoginSchema } from '@/utils/schemas/loginSchema';
import type { RegisterSchema } from '@/utils/schemas/registerSchema';

import instance from '@/utils/request';

export const authApi = {
  register: async (data: RegisterSchema) => {
    return await instance.post('/auth/register', data);
  },
  login: (data: LoginSchema) => {
    return instance.post('/auth/token/login/', data);
  },
  logout: (data: { refreshToken: string }) => {
    return instance.post('/auth/token/revoke/', data);
  },
};
