import type { ApiResponse } from '@/types/request';
import type { ProjectResponse } from '@/types/response';
import type { CreateProjectSchema } from '@/utils/schemas/createProjectSchema';

import request from '@/utils/request';

export const projectApi = {
  // 用於概覽頁面
  getOverviewProjects: (): Promise<ApiResponse<ProjectResponse[]>> => {
    return request.get('/projects/overview');
  },
  // 獲取我創建的專案
  getOwnedProjects: (): Promise<ApiResponse<ProjectResponse[]>> => {
    return request.get('/projects');
  },
  // 獲取我作為協作者參與的專案
  getCollaboratingProjects: (): Promise<ApiResponse<ProjectResponse[]>> => {
    return request.get('/projects/collaborating');
  },
  getProjects: (): Promise<ApiResponse<ProjectResponse[]>> => {
    return request.get('/projects');
  },
  getProjectById: (id: string): Promise<ApiResponse<ProjectResponse>> => {
    return request.get(`/projects/${id}`);
  },
  createProject: (data: CreateProjectSchema): Promise<ApiResponse<ProjectResponse>> => {
    return request.post('/projects', data);
  },
  updateProject: (
    id: string,
    data: Partial<CreateProjectSchema>
  ): Promise<ApiResponse<ProjectResponse>> => {
    return request.patch(`/projects/${id}`, data);
  },
  deleteProject: (id: string): Promise<ApiResponse<void>> => {
    return request.delete(`/projects/${id}`);
  },
  getProjectShare: (id: string): Promise<ApiResponse<ProjectResponse>> => {
    return request.get(`${import.meta.env.VITE_API_URL}/projects/shared/${id}`);
  },
  toggleProjectShare: (id: string): Promise<ApiResponse<ProjectResponse>> => {
    return request.patch(`/projects/${id}/share`);
  },
};
