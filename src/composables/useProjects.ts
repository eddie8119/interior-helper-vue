/**
 * 用於獲取。
 *
 * @returns {Object}
 */

import { useQuery } from '@tanstack/vue-query';
import { type Ref, watch } from 'vue';

import type { ProjectResponse } from '@/types/response';
import { projectApi } from '@/api/project';
import { useProjectsStore } from '@/stores/projects';

interface UseProjectsReturn {
  isLoadingProjects: Ref<boolean>;
  error: Ref<Error | null>;
  fetchedProjects: Ref<ProjectResponse[] | undefined>;
  refetchProjects: () => Promise<void>;
  projectsUpdatedAt: Ref<number>;
}

export function useProjects(): UseProjectsReturn {
  const projectsStore = useProjectsStore();

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

  // Watch for changes in fetchedProjects and update the store
  watch(
    fetchedProjects,
    (newProjects) => {
      if (newProjects) {
        // const simplified: SimplifiedProject[] = newProjects.map((p) => ({
        //   id: p.id,
        //   title: p.title,
        //   constructionContainer: p.constructionContainer
        //     ? p.constructionContainer.map((c) => ({ id: c.id, name: c.name }))
        //     : [],
        // }));
        projectsStore.setProjects(newProjects);
      }
    },
    { immediate: true }
  );

  const refetchProjects = async (): Promise<void> => {
    await refetchQueryProjects();
  };

  return {
    isLoadingProjects,
    error,
    fetchedProjects,
    refetchProjects,
    projectsUpdatedAt,
  };
}
