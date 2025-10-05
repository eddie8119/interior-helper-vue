import type { ApiResponse } from '@/types/request';
import type { TaskResponse } from '@/types/response';
import type { CreateTaskSchema } from '@/utils/schemas/createTaskSchema';

import request from '@/utils/request';

export const taskApi = {
  // 批次任務
  getTasksByProjectId: (projectId: string): Promise<ApiResponse<TaskResponse[]>> => {
    return request.get(`/tasks/${projectId}`);
  },
  updateProjectTasks: (
    data: TaskResponse[],
    projectId: string
  ): Promise<ApiResponse<TaskResponse[]>> => {
    return request.patch(`/tasks/${projectId}`, data);
  },

  updateProjectTasksWithBeacon: (data: TaskResponse[], projectId: string): boolean => {
    const url = `${request.defaults.baseURL}/tasks/${projectId}`;
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json; charset=UTF-8' });
    return navigator.sendBeacon(url, blob);
  },

  // 個別任務
  createTask: (data: CreateTaskSchema, projectId: string): Promise<ApiResponse<TaskResponse>> => {
    return request.post(`/tasks/${projectId}`, data);
  },
  getTaskById: (id: string): Promise<ApiResponse<TaskResponse>> => {
    return request.get(`/tasks/detail/${id}`);
  },
  updateTask: (id: string, data: Partial<CreateTaskSchema>): Promise<ApiResponse<TaskResponse>> => {
    return request.patch(`/tasks/detail/${id}`, data);
  },
  deleteTask: (id: string): Promise<ApiResponse<void>> => {
    return request.delete(`/tasks/${id}`);
  },
};
