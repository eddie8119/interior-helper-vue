/**
 * 用於獲取專案任務資料。
 *
 * @returns {Object}
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { type Ref, ref } from 'vue';

import type { TaskResponse } from '@/types/response';
import type { CreateTaskSchema } from '@/utils/schemas/createTaskSchema';

import { taskApi } from '@/api/task';

interface UseTasksReturn {
  // 批次
  // 批次獲取專案任務列表
  isLoadingTasks: Ref<boolean>;
  errorTasks: Ref<Error | null>;
  fetchedTasks: Ref<TaskResponse[] | null>;
  tasksUpdatedAt: Ref<number>;
  refetchTasks: () => Promise<void>;
  // 批次更新專案任務
  updateProjectTasks: (data: TaskResponse[]) => Promise<TaskResponse[] | null>;
  isUpdating: Ref<boolean>;
  updateError: Ref<Error | null>;

  // 個別更新專案任務
  // 創建任務
  createTask: (payload: CreateTaskPayload) => Promise<TaskResponse | null>;
  isCreatingTask: Ref<boolean>;
  createError: Ref<Error | null>;
  // 更新單個任務
  updateTask: (taskId: string, taskData: Partial<TaskResponse>) => Promise<{ success: boolean; data?: TaskResponse; message?: string }>;
  isUpdatingTask: Ref<boolean>;
  updateTaskError: Ref<Error | null>;
  // 刪除任務
  deleteTask: (taskId: string) => Promise<boolean>;
  isDeletingTask: Ref<boolean>;
  deleteError: Ref<Error | null>;
}

// The data for the mutation, including the dynamic projectId
interface CreateTaskPayload {
  taskData: CreateTaskSchema;
  projectId: string;
}

const QUERY_KEY = 'tasks';

export function useTasks(projectId?: string): UseTasksReturn {
  // 用於追蹤任務狀態
  const isCreatingTask = ref(false);
  const createError = ref<Error | null>(null);
  const isUpdating = ref(false);
  const updateError = ref<Error | null>(null);
  const isUpdatingTask = ref(false);
  const updateTaskError = ref<Error | null>(null);
  const isDeletingTask = ref(false);
  const deleteError = ref<Error | null>(null);

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
      const response = await taskApi.getTasksByProjectId(projectId!);
      return response.data;
    },
    enabled: !!projectId, // Only run the query if projectId is available
    staleTime: 1000 * 10 * 3, // 30秒
    gcTime: 1000 * 60 * 5, // 5分鐘
  });

  // 重新獲取任務列表
  const refetchTasks = async (): Promise<void> => {
    await refetchQueryTasks();
  };

  const queryClient = useQueryClient();

  // 創建任務 mutation
  const { mutateAsync: mutateCreateTask } = useMutation<TaskResponse, Error, CreateTaskPayload>({
    // Specify types for better safety
    mutationFn: async (payload: CreateTaskPayload) => {
      const { taskData, projectId: dynamicProjectId } = payload;
      const response = await taskApi.createTask(taskData, dynamicProjectId);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      // Invalidate the query for the specific project's tasks
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, variables.projectId] });
    },
  });

  // 創建任務方法
  const createTask = async (payload: CreateTaskPayload): Promise<TaskResponse | null> => {
    try {
      isCreatingTask.value = true;
      createError.value = null;

      const result = await mutateCreateTask(payload);
      return result || null;
    } catch (err: unknown) {
      createError.value = err instanceof Error ? err : new Error(String(err));
      console.error('創建任務失敗:', err);
      return null;
    } finally {
      isCreatingTask.value = false;
    }
  };

  // 批次更新專案任務 mutation
  const { mutateAsync: mutateUpdateProjectTasks } = useMutation({
    mutationFn: async (data: TaskResponse[]) => {
      if (!projectId) throw new Error('Project ID is not provided');
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

  // 更新單個任務 mutation
  const { mutateAsync: mutateUpdateTask } = useMutation({
    mutationFn: async ({ taskId, taskData }: { taskId: string; taskData: Partial<TaskResponse> }) => {
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
      isUpdatingTask.value = true;
      updateTaskError.value = null;

      const result = await mutateUpdateTask({ taskId, taskData });
      return result;
    } catch (err: unknown) {
      updateTaskError.value = err instanceof Error ? err : new Error(String(err));
      console.error('更新任務失敗:', err);
      return { success: false, message: '更新任務失敗' };
    } finally {
      isUpdatingTask.value = false;
    }
  };

  // 刪除任務 mutation
  const { mutateAsync: mutateDeleteTask } = useMutation({
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
      isDeletingTask.value = true;
      deleteError.value = null;

      const result = await mutateDeleteTask(taskId);
      return result.success;
    } catch (err: unknown) {
      deleteError.value = err instanceof Error ? err : new Error(String(err));
      console.error('刪除任務失敗:', err);
      return false;
    } finally {
      isDeletingTask.value = false;
    }
  };

  return {
    // 獲取專案任務列表
    isLoadingTasks,
    errorTasks,
    fetchedTasks: fetchedTasks as Ref<TaskResponse[] | null>,
    tasksUpdatedAt,
    refetchTasks,
    // 批次更新專案任務
    updateProjectTasks,
    isUpdating,
    updateError,
    // 創建任務
    createTask,
    isCreatingTask,
    createError,
    // 更新單個任務
    updateTask,
    isUpdatingTask,
    updateTaskError,
    // 刪除任務
    deleteTask,
    isDeletingTask,
    deleteError,
  };
}
