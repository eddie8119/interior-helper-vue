import type { ApiResponse } from '@/types/request';
import type { ProjectResponse } from '@/types/response';
import type { CreateProjectSchema } from '@/utils/schemas/createProjectSchema';

import request from '@/utils/request';

export const projectApi = {
  getProjects: (): Promise<ApiResponse<ProjectResponse[]>> => {
    return request.get('/projects');
  },
  createProject: (data: CreateProjectSchema): Promise<ApiResponse<ProjectResponse>> => {
    return request.post('/projects', data);
  },
};
