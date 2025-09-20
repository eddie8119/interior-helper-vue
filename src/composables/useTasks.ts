/**
 * 用於獲取專案任務資料。
 *
 * @returns {Object}
 */

import { useMutation, useQuery } from '@tanstack/vue-query';
import { type Ref, ref } from 'vue';

import type { TaskResponse } from '@/types/response';
import type { CreateTaskSchema } from '@/utils/schemas/createTaskSchema';

import { taskApi } from '@/api/task';

interface UseTasksReturn {
  // 批次
  // 批次獲取專案任務列表
  isLoadingTasks: Ref<boolean>;
  error: Ref<Error | null>;
  fetchedTasks: Ref<TaskResponse[] | null>;
  tasksUpdatedAt: Ref<number>;
  refetchTasks: () => Promise<void>;
  // 批次更新專案任務
  updateProjectTasks: (data: TaskResponse[]) => Promise<TaskResponse[] | null>;
  isUpdating: Ref<boolean>;
  updateError: Ref<Error | null>;

  // 個別更新專案任務
  // 創建任務
  createTask: (data: CreateTaskSchema) => Promise<TaskResponse | null>;
  isCreating: Ref<boolean>;
  createError: Ref<Error | null>;
}

export function useTasks(projectId: string): UseTasksReturn {
  // 用於追蹤任務狀態
  const isCreating = ref(false);
  const createError = ref<Error | null>(null);
  const isUpdating = ref(false);
  const updateError = ref<Error | null>(null);

  // 獲取專案任務列表
  const {
    data: fetchedTasks,
    isLoading: isLoadingTasks,
    refetch: refetchQueryTasks,
    error,
    dataUpdatedAt: tasksUpdatedAt,
  } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const response = await taskApi.getTasksByProjectId(projectId);
      return response.data;
    },
    staleTime: 1000 * 10 * 3, // 30秒
    gcTime: 1000 * 60 * 5, // 5分鐘
  });

  // 重新獲取任務列表
  const refetchTasks = async (): Promise<void> => {
    await refetchQueryTasks();
  };

  // 創建任務 mutation
  const { mutateAsync: mutateCreateTask } = useMutation({
    mutationFn: async (data: CreateTaskSchema) => {
      const response = await taskApi.createTask(data, projectId);
      return response.data;
    },
    onSuccess: () => {
      refetchQueryTasks();
    },
  });

  // 創建任務方法
  const createTask = async (data: CreateTaskSchema): Promise<TaskResponse | null> => {
    try {
      isCreating.value = true;
      createError.value = null;

      const result = await mutateCreateTask(data);
      return result || null;
    } catch (err: unknown) {
      createError.value = err instanceof Error ? err : new Error(String(err));
      console.error('創建任務失敗:', err);
      return null;
    } finally {
      isCreating.value = false;
    }
  };

  // 批次更新專案任務 mutation
  const { mutateAsync: mutateUpdateProjectTasks } = useMutation({
    mutationFn: async (data: TaskResponse[]) => {
      const response = await taskApi.updateProjectTasks(data, projectId);
      return response.data;
    },
    onSuccess: () => {
      refetchQueryTasks();
    },
  });

  // 批次更新專案任務方法
  const updateProjectTasks = async (data: TaskResponse[]): Promise<TaskResponse[] | null> => {
    try {
      isUpdating.value = true;
      updateError.value = null;

      const result = await mutateUpdateProjectTasks(data);
      return result || null;
    } catch (err: unknown) {
      updateError.value = err instanceof Error ? err : new Error(String(err));
      console.error('更新專案任務失敗:', err);
      return null;
    } finally {
      isUpdating.value = false;
    }
  };

  return {
    // 獲取專案任務列表
    isLoadingTasks,
    error,
    fetchedTasks: fetchedTasks as Ref<TaskResponse[] | null>,
    tasksUpdatedAt,
    refetchTasks,
    // 批次更新專案任務
    updateProjectTasks,
    isUpdating,
    updateError,
    // 創建任務
    createTask,
    isCreating,
    createError,
  };
}
