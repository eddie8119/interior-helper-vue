/**
 * 用於管理專案相關操作
 * 包含建立、更新、刪除、分享等功能
 *
 * @returns {Object}
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query';
import { type Ref } from 'vue';

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
  createProjectError: Ref<Error | null>;

  // 更新專案
  updateProject: (data: Partial<CreateProjectSchema>) => Promise<ProjectResponse | null>;
  isUpdatingProject: Ref<boolean>;
  updateProjectError: Ref<Error | null>;

  // 刪除專案
  deleteProject: (id: string) => Promise<void>;
  isDeletingProject: Ref<boolean>;
  deleteProjectError: Ref<Error | null>;

  // 分享專案
  fetchedSharedProject: Ref<ProjectResponse | null>;
  isLoadingSharedProject: Ref<boolean>;
  sharedProjectError: Ref<Error | null>;
  refetchSharedProject: () => Promise<void>;

  // 切換分享狀態
  toggleProjectShare: (id: string) => Promise<ProjectResponse | null>;
  isTogglingShare: Ref<boolean>;
  toggleShareProjectError: Ref<Error | null>;
}

const QUERY_KEY = 'project';

export function useProject(id?: string): UseProjectReturn {
  const queryClient = useQueryClient();

  // ==================== 獲取專案資料 ====================
  const {
    data: fetchedProject,
    isLoading: isLoadingProject,
    refetch: refetchQueryProject,
    error: projectError,
  } = useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: async () => {
      if (!id) throw new Error('Project ID is required');
      const response = await projectApi.getProjectById(id);
      return response.data;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 3,
  });

  const refetchProject = async (): Promise<void> => {
    await refetchQueryProject();
  };

  // ==================== 建立專案 ====================
  const {
    mutateAsync: mutateCreate,
    isPending: isCreatingProject,
    error: createProjectError,
  } = useMutation({
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
      const result = await mutateCreate(data);
      return result || null;
    } catch (err: unknown) {
      console.error('建立專案失敗:', err);
      return null;
    }
  };

  // ==================== 更新專案 ====================
  const {
    mutateAsync: mutateUpdate,
    isPending: isUpdatingProject,
    error: updateProjectError,
  } = useMutation({
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
      console.error('更新專案失敗:', err);
      return null;
    }
  };

  // ==================== 刪除專案 ====================
  const {
    mutateAsync: mutateDelete,
    isPending: isDeletingProject,
    error: deleteProjectError,
  } = useMutation({
    mutationFn: async (projectId: string) => {
      const response = await projectApi.deleteProject(projectId);
      if (!response.success) {
        throw new Error('刪除專案失敗: API 未返回資料');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: ['overview-projects'] });
    },
  });

  const deleteProject = async (projectId: string): Promise<void> => {
    try {
      await mutateDelete(projectId);
    } catch (err: unknown) {
      console.error('刪除專案失敗:', err);
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
      if (!id) throw new Error('Project ID is required');
      const response = await projectApi.getProjectShare(id);
      return response.data;
    },
    staleTime: 1000 * 60 * 3,
  });

  const refetchSharedProject = async (): Promise<void> => {
    await refetchQuerySharedProject();
  };

  // ==================== 切換分享狀態 ====================
  const {
    mutateAsync: mutateToggleShare,
    isPending: isTogglingShare,
    error: toggleShareProjectError,
  } = useMutation({
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
      const result = await mutateToggleShare(projectId);
      return result || null;
    } catch (err: unknown) {
      console.error('切換專案分享失敗:', err);
      return null;
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
    createProjectError,
    // 更新專案
    updateProject,
    isUpdatingProject,
    updateProjectError,
    // 刪除專案
    deleteProject,
    isDeletingProject,
    deleteProjectError,
    // 分享專案
    fetchedSharedProject: fetchedSharedProject as Ref<ProjectResponse | null>,
    isLoadingSharedProject,
    sharedProjectError,
    refetchSharedProject,
    // 切換分享狀態
    toggleProjectShare,
    isTogglingShare,
    toggleShareProjectError,
  };
}
