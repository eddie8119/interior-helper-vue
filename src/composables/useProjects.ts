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
  isLoadingProjects: Ref<boolean>;
  error: Ref<Error | null>;
  fetchedProjects: Ref<ProjectResponse[]>;
  refetchProjects: () => Promise<void>;
  projectsUpdatedAt: Ref<number>;
}

export function useProjects(): UseProjectsReturn {
  const {
    data: fetchedProjects,
    isLoading: isLoadingProjects,
    refetch: refetchQueryProjects,
    error,
    dataUpdatedAt: projectsUpdatedAt,
  } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await projectApi.getProjects();
      return response.data;
    },
    staleTime: 1000 * 10 * 3,
    gcTime: 1000 * 60 * 5,
  });

  const refetchProjects = async (): Promise<void> => {
    await refetchQueryProjects();
  };

  return {
    isLoadingProjects,
    error,
    fetchedProjects: fetchedProjects as Ref<ProjectResponse[]>,
    refetchProjects,
    projectsUpdatedAt,
  };
}
