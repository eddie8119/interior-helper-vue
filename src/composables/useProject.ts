/**
 * 用於管理專案相關操作
 * 包含建立、更新、刪除、分享等功能
 *
 * @returns {Object}
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { type Ref, ref } from 'vue';

import type { ProjectResponse } from '@/types/response';
import type { CreateProjectSchema } from '@/utils/schemas/createProjectSchema';

import { projectApi } from '@/api/project';

interface UseProjectReturn {
  // 獲取專案資料
  fetchedProject: Ref<ProjectResponse | null>;
  isLoadingProject: Ref<boolean>;
  projectError: Ref<Error | null>;
  refetchProject: () => Promise<void>;

  // 建立專案
  createProject: (data: CreateProjectSchema) => Promise<ProjectResponse | null>;
  isCreatingProject: Ref<boolean>;
  createError: Ref<Error | null>;

  // 更新專案
  updateProject: (data: Partial<CreateProjectSchema>) => Promise<ProjectResponse | null>;
  isUpdatingProject: Ref<boolean>;
  updateError: Ref<Error | null>;

  // 刪除專案
  deleteProject: (id: string) => Promise<void>;
  isDeletingProject: Ref<boolean>;
  deleteError: Ref<Error | null>;

  // 分享專案
  fetchedSharedProject: Ref<ProjectResponse | null>;
  isLoadingSharedProject: Ref<boolean>;
  sharedProjectError: Ref<Error | null>;
  refetchSharedProject: () => Promise<void>;

  // 切換分享狀態
  toggleProjectShare: (id: string) => Promise<ProjectResponse | null>;
  isTogglingShare: Ref<boolean>;
  toggleShareError: Ref<Error | null>;
}

const QUERY_KEY = 'project';

export function useProject(id: string): UseProjectReturn {
  const queryClient = useQueryClient();

  // 狀態追蹤
  const isCreatingProject = ref(false);
  const createError = ref<Error | null>(null);
  const isUpdatingProject = ref(false);
  const updateError = ref<Error | null>(null);
  const isDeletingProject = ref(false);
  const deleteError = ref<Error | null>(null);
  const isTogglingShare = ref(false);
  const toggleShareError = ref<Error | null>(null);

  // ==================== 獲取專案資料 ====================
  const {
    data: fetchedProject,
    isLoading: isLoadingProject,
    refetch: refetchQueryProject,
    error: projectError,
  } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      const response = await projectApi.getProjectById(id);
      return response.data;
    },
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 5,
  });

  const refetchProject = async (): Promise<void> => {
    await refetchQueryProject();
  };

  // ==================== 建立專案 ====================
  const { mutateAsync: mutateCreate } = useMutation({
    mutationFn: async (data: CreateProjectSchema) => {
      const response = await projectApi.createProject(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['overview-projects'] });
    },
  });

  const createProject = async (data: CreateProjectSchema): Promise<ProjectResponse | null> => {
    try {
      isCreatingProject.value = true;
      createError.value = null;

      const result = await mutateCreate(data);
      return result || null;
    } catch (err: unknown) {
      createError.value = err instanceof Error ? err : new Error(String(err));
      console.error('建立專案失敗:', err);
      return null;
    } finally {
      isCreatingProject.value = false;
    }
  };

  // ==================== 更新專案 ====================
  const { mutateAsync: mutateUpdate } = useMutation({
    mutationFn: async (data: Partial<CreateProjectSchema>) => {
      const response = await projectApi.updateProject(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, id] });
    },
  });

  const updateProject = async (
    data: Partial<CreateProjectSchema>
  ): Promise<ProjectResponse | null> => {
    try {
      isUpdatingProject.value = true;
      updateError.value = null;

      // 如果傳入的數據不完整，則合併當前專案數據
      const currentProject = fetchedProject.value;
      let updateData: CreateProjectSchema;

      if (currentProject) {
        // 合併現有數據和更新數據
        updateData = {
          title: data.title ?? currentProject.title,
          type: data.type ?? currentProject.type,
          constructionContainer:
            data.constructionContainer ?? currentProject.constructionContainer ?? [],
        };
      } else {
        // 如果沒有現有數據，則直接使用更新數據
        updateData = data as CreateProjectSchema;
      }

      const result = await mutateUpdate(updateData);
      return result || null;
    } catch (err: unknown) {
      updateError.value = err instanceof Error ? err : new Error(String(err));
      console.error('更新專案失敗:', err);
      return null;
    } finally {
      isUpdatingProject.value = false;
    }
  };

  // ==================== 刪除專案 ====================
  const { mutateAsync: mutateDelete } = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await projectApi.deleteProject(projectId);
      if (!response.success) {
        throw new Error('刪除專案失敗: API 未返回資料');
      }
    },
  });

  const deleteProject = async (projectId: string): Promise<void> => {
    try {
      isDeletingProject.value = true;
      deleteError.value = null;

      await mutateDelete(projectId);
    } catch (err: unknown) {
      deleteError.value = err instanceof Error ? err : new Error(String(err));
      console.error('刪除專案失敗:', err);
    } finally {
      isDeletingProject.value = false;
    }
  };

  // ==================== 獲取分享專案 ====================
  const {
    data: fetchedSharedProject,
    isLoading: isLoadingSharedProject,
    refetch: refetchQuerySharedProject,
    error: sharedProjectError,
  } = useQuery({
    queryKey: [QUERY_KEY, 'shared', id],
    queryFn: async () => {
      const response = await projectApi.getProjectShare(id);
      return response.data;
    },
    staleTime: 1000 * 60 * 3,
    gcTime: 1000 * 60 * 5,
  });

  const refetchSharedProject = async (): Promise<void> => {
    await refetchQuerySharedProject();
  };

  // ==================== 切換分享狀態 ====================
  const { mutateAsync: mutateToggleShare } = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await projectApi.toggleProjectShare(projectId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY, 'shared', id] });
    },
  });

  const toggleProjectShare = async (projectId: string): Promise<ProjectResponse | null> => {
    try {
      isTogglingShare.value = true;
      toggleShareError.value = null;

      const result = await mutateToggleShare(projectId);
      return result || null;
    } catch (err: unknown) {
      toggleShareError.value = err instanceof Error ? err : new Error(String(err));
      console.error('切換專案分享失敗:', err);
      return null;
    } finally {
      isTogglingShare.value = false;
    }
  };

  return {
    // 獲取專案資料
    fetchedProject: fetchedProject as Ref<ProjectResponse | null>,
    isLoadingProject,
    projectError,
    refetchProject,
    // 建立專案
    createProject,
    isCreatingProject,
    createError,
    // 更新專案
    updateProject,
    isUpdatingProject,
    updateError,
    // 刪除專案
    deleteProject,
    isDeletingProject,
    deleteError,
    // 分享專案
    fetchedSharedProject: fetchedSharedProject as Ref<ProjectResponse | null>,
    isLoadingSharedProject,
    sharedProjectError,
    refetchSharedProject,
    // 切換分享狀態
    toggleProjectShare,
    isTogglingShare,
    toggleShareError,
  };
}
