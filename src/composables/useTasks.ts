/**
 * 用於獲取專案任務資料。
 *
 * @returns {Object}
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { type Ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { TaskResponse } from '@/types/response';
import type { CreateTaskSchema } from '@/utils/schemas/createTaskSchema';

import { taskApi } from '@/api/task';

interface UseTasksReturn {
  // 批次獲取專案任務列表
  isLoadingTasks: Ref<boolean>;
  errorTasks: Ref<Error | null>;
  fetchedTasks: Ref<TaskResponse[] | null>;
  tasksUpdatedAt: Ref<number>;
  refetchTasks: () => Promise<void>;
  // 獲取所有任務
  isLoadingAllTasks: Ref<boolean>;
  errorAllTasks: Ref<Error | null>;
  fetchedAllTasks: Ref<TaskResponse[] | null>;
  allTasksUpdatedAt: Ref<number>;
  refetchAllTasks: () => Promise<void>;
  // 批次更新專案任務
  updateProjectTasks: (data: TaskResponse[]) => Promise<TaskResponse[] | null>;
  isUpdatingProjectTasks: Ref<boolean>;
  updateProjectTasksError: Ref<Error | null>;
  // 創建任務
  createTask: (payload: CreateTaskPayload) => Promise<TaskResponse | null>;
  isCreatingTask: Ref<boolean>;
  createTaskError: Ref<Error | null>;
  // 更新單個任務
  updateTask: (
    taskId: string,
    taskData: Partial<TaskResponse>
  ) => Promise<{ success: boolean; data?: TaskResponse; message?: string }>;
  isUpdatingTask: Ref<boolean>;
  updateTaskError: Ref<Error | null>;
  // 刪除任務
  deleteTask: (taskId: string) => Promise<boolean>;
  isDeletingTask: Ref<boolean>;
  deleteTaskError: Ref<Error | null>;
}

// The data for the mutation, including the dynamic projectId
interface CreateTaskPayload {
  taskData: CreateTaskSchema;
  projectId: string;
}

const QUERY_KEY = 'tasks';

export function useTasks(projectId?: string): UseTasksReturn {
  const queryClient = useQueryClient();
  const { t } = useI18n();

  // 獲取所有任務
  const {
    data: fetchedAllTasks,
    isLoading: isLoadingAllTasks,
    refetch: refetchQueryAllTasks,
    error: errorAllTasks,
    dataUpdatedAt: allTasksUpdatedAt,
  } = useQuery({
    queryKey: [QUERY_KEY, 'all'],
    queryFn: async () => {
      const response = await taskApi.getAllTasks();
      return response.data;
    },
    staleTime: 1000 * 10 * 3, // 30秒
  });

  // 重新獲取所有任務
  const refetchAllTasks = async (): Promise<void> => {
    await refetchQueryAllTasks();
  };

  // 獲取專案任務列表
  const {
    data: fetchedTasks,
    isLoading: isLoadingTasks,
    refetch: refetchQueryTasks,
    error: errorTasks,
    dataUpdatedAt: tasksUpdatedAt,
  } = useQuery({
    queryKey: [QUERY_KEY, projectId],
    queryFn: async () => {
      if (!projectId) throw new Error('Project ID is required');
      const response = await taskApi.getTasksByProjectId(projectId);
      return response.data;
    },
    enabled: !!projectId,
    staleTime: 1000 * 10 * 3, // 30秒
  });

  // 重新獲取任務列表
  const refetchTasks = (): Promise<void> => refetchQueryTasks();

  // 創建任務 mutation
  const {
    mutateAsync: mutateCreateTask,
    isPending: isCreatingTask,
    error: createTaskError,
  } = useMutation<TaskResponse, Error, CreateTaskPayload>({
    mutationFn: async (payload: CreateTaskPayload) => {
      const { taskData, projectId: dynamicProjectId } = payload;
      const response = await taskApi.createTask(taskData, dynamicProjectId);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.projectId] });
    },
  });

  // 創建任務方法
  const createTask = async (payload: CreateTaskPayload): Promise<TaskResponse | null> => {
    try {
      const result = await mutateCreateTask(payload);
      return result || null;
    } catch (err: unknown) {
      console.error('創建任務失敗:', err);
      return null;
    }
  };

  // 批次更新專案任務 mutation
  const {
    mutateAsync: mutateUpdateProjectTasks,
    isPending: isUpdatingProjectTasks,
    error: updateProjectTasksError,
  } = useMutation({
    mutationFn: async (data: TaskResponse[]) => {
      if (!projectId) throw new Error('Project ID is not provided');
      const response = await taskApi.updateProjectTasks(data, projectId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, projectId] });
    },
  });

  // 批次更新專案任務方法
  const updateProjectTasks = async (data: TaskResponse[]): Promise<TaskResponse[] | null> => {
    try {
      const result = await mutateUpdateProjectTasks(data);
      return result || null;
    } catch (err: unknown) {
      console.error('更新專案任務失敗:', err);
      return null;
    }
  };

  // 更新單個任務 mutation
  const {
    mutateAsync: mutateUpdateTask,
    isPending: isUpdatingTask,
    error: updateTaskError,
  } = useMutation({
    mutationFn: async ({
      taskId,
      taskData,
    }: {
      taskId: string;
      taskData: Partial<TaskResponse>;
    }) => {
      const response = await taskApi.updateTask(taskId, taskData);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, projectId] });
    },
  });

  // 更新單個任務方法
  const updateTask = async (
    taskId: string,
    taskData: Partial<TaskResponse>
  ): Promise<{ success: boolean; data?: TaskResponse; message?: string }> => {
    try {
      const result = await mutateUpdateTask({ taskId, taskData });
      return result;
    } catch (err: unknown) {
      console.error('更新任務失敗:', err);
      return { success: false, message: t('message.error.update') };
    }
  };

  // 刪除任務 mutation
  const {
    mutateAsync: mutateDeleteTask,
    isPending: isDeletingTask,
    error: deleteTaskError,
  } = useMutation({
    mutationFn: async (taskId: string) => {
      const response = await taskApi.deleteTask(taskId);
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, projectId] });
    },
  });

  // 刪除任務方法
  const deleteTask = async (taskId: string): Promise<boolean> => {
    try {
      const result = await mutateDeleteTask(taskId);
      return result.success;
    } catch (err: unknown) {
      console.error('刪除任務失敗:', err);
      return false;
    }
  };

  return {
    // 獲取專案任務列表
    isLoadingTasks,
    errorTasks,
    fetchedTasks: fetchedTasks as Ref<TaskResponse[] | null>,
    tasksUpdatedAt,
    refetchTasks,
    // 獲取所有任務
    isLoadingAllTasks,
    errorAllTasks,
    fetchedAllTasks: fetchedAllTasks as Ref<TaskResponse[] | null>,
    allTasksUpdatedAt,
    refetchAllTasks,
    // 批次更新專案任務
    updateProjectTasks,
    isUpdatingProjectTasks,
    updateProjectTasksError,
    // 創建任務
    createTask,
    isCreatingTask,
    createTaskError,
    // 更新單個任務
    updateTask,
    isUpdatingTask,
    updateTaskError,
    // 刪除任務
    deleteTask,
    isDeletingTask,
    deleteTaskError,
  };
}
