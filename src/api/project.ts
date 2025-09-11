import type { AuthResponse } from '@/api/response';
import type { ApiResponse } from '@/types/request';

import request from '@/utils/request';

export const projectApi = {
  getProjects: (): Promise<ApiResponse<AuthResponse>> => {
    return request.get('/projects/');
  },
};
