import { computed } from 'vue';

import type { ProjectResponse } from '@/types/response';
import type { ConstructionSelection } from '@/types/selection';
import type { ProjectTitle } from '@/types/project';

import { useProjects } from '@/composables/useProjects';

export function useOverviewSources() {
  const { fetchedOverviewProjects, isLoadingOverviewProjects } = useProjects();

  // Extract and deduplicate construction containers
  const constructionList = computed(() => {
    if (!fetchedOverviewProjects.value || fetchedOverviewProjects.value.length === 0) {
      return [];
    }

    // Collect all construction containers
    const allConstructions = fetchedOverviewProjects.value.flatMap((project: ProjectResponse) => {
      return project.constructionContainer || [];
    });

    // Deduplicate by id
    const seen = new Set<string>();
    const unique = allConstructions.filter((construction: ConstructionSelection) => {
      if (seen.has(construction.id)) {
        return false;
      }
      seen.add(construction.id);
      return true;
    });

    return unique;
  });

  // Extract project id and title
  const projectTitleList = computed(() => {
    if (!fetchedOverviewProjects.value || fetchedOverviewProjects.value.length === 0) {
      return [] as ProjectTitle[];
    }
    return fetchedOverviewProjects.value.map((project: ProjectResponse) => ({
      id: project.id,
      title: project.title,
    }));
  });

  return {
    fetchedOverviewProjects,
    isLoadingOverviewProjects,
    constructionList,
    projectTitleList,
  };
}
