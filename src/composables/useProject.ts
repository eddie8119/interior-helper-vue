/**
 * 用於獲取專案資料。
 *
 * @returns {Object}
 */

import { useMutation, useQuery } from '@tanstack/vue-query';
import { type Ref, ref } from 'vue';

import type { ProjectResponse } from '@/types/response';
import type { CreateProjectSchema } from '@/utils/schemas/createProjectSchema';

import { projectApi } from '@/api/project';

interface UseProjectsReturn {
  isLoadingProject: Ref<boolean>;
  error: Ref<Error | null>;
  fetchedProject: Ref<ProjectResponse | null>;
  projectUpdatedAt: Ref<number>;
  updateProject: (data: Partial<CreateProjectSchema>) => Promise<ProjectResponse | null>;
  deleteProject: (id: string) => Promise<void>;
  isUpdating: Ref<boolean>;
  updateError: Ref<Error | null>;
}

export function useProject(id: string): UseProjectsReturn {
  // 用於追蹤更新狀態
  const isUpdating = ref(false);
  const updateError = ref<Error | null>(null);

  // 獲取專案資料
  const {
    data: fetchedProject,
    isLoading: isLoadingProject,
    refetch: refetchQueryProject,
    error,
    dataUpdatedAt: projectUpdatedAt,
  } = useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const response = await projectApi.getProjectById(id);
      return response.data;
    },
    staleTime: 1000 * 10 * 3,
    gcTime: 1000 * 60 * 5,
  });

  // 更新專案使用 useMutation
  const { mutateAsync: mutateProject } = useMutation({
    mutationFn: async (data: Partial<CreateProjectSchema>) => {
      const response = await projectApi.updateProject(id, data);
      return response.data;
    },
    onSuccess: () => {
      refetchQueryProject();
    },
  });

  // 更新專案方法
  const updateProject = async (
    data: Partial<CreateProjectSchema>
  ): Promise<ProjectResponse | null> => {
    try {
      isUpdating.value = true;
      updateError.value = null;

      // 如果傳入的數據不完整，則合併當前專案數據
      const currentProject = fetchedProject.value;
      let updateData: CreateProjectSchema;

      if (currentProject) {
        // 合併現有數據和更新數據
        updateData = {
          title: data.title ?? currentProject.title,
          type: data.type ?? currentProject.type,
          constructionContainer: data.constructionContainer ?? currentProject.constructionContainer,
        };
      } else {
        // 如果沒有現有數據，則直接使用更新數據
        updateData = data as CreateProjectSchema;
      }

      const result = await mutateProject(updateData);
      return result || null;
    } catch (err: any) {
      updateError.value = err;
      console.error('更新專案失敗:', err);
      return null;
    } finally {
      isUpdating.value = false;
    }
  };

  // 刪除專案
  const { mutateAsync } = useMutation<void, Error, string>({
    mutationFn: async (id: string) => {
      const response = await projectApi.deleteProject(id);
      if (!response.success) {
        throw new Error('刪除專案失敗: API 未返回資料');
      }
    },
    onError: (error) => {
      console.error('刪除專案失敗:', error);
    },
  });

  const deleteProject = async (id: string): Promise<void> => {
    try {
      await mutateAsync(id);
    } catch (error) {
      console.error('刪除專案失敗:', error);
    }
  };

  return {
    isLoadingProject,
    error,
    fetchedProject: fetchedProject as Ref<ProjectResponse | null>,
    projectUpdatedAt,
    updateProject,
    deleteProject,
    isUpdating,
    updateError,
  };
}
