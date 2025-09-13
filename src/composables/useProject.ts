/**
 * 用於獲取。
 *
 * @returns {Object}
 */

import { useQuery } from '@tanstack/vue-query';
import { type Ref } from 'vue';

import type { ProjectResponse } from '@/types/response';

import { projectApi } from '@/api/project';

interface UseProjectsReturn {
  isLoadingProject: Ref<boolean>;
  error: Ref<Error | null>;
  fetchedProject: Ref<ProjectResponse | null>;
  refetchProject: () => Promise<void>;
  projectUpdatedAt: Ref<number>;
}

export function useProject(id: string): UseProjectsReturn {
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
    staleTime: 1000 * 10 * 3, // 10 秒內認為數據是新鮮的
    gcTime: 1000 * 60 * 5, // 5 分鐘後清除緩存
  });

  const refetchProject = async (): Promise<void> => {
    await refetchQueryProject();
  };

  return {
    isLoadingProject,
    error,
    fetchedProject: fetchedProject as Ref<ProjectResponse | null>,
    refetchProject,
    projectUpdatedAt,
  };
}
