import { computed, ref, type Ref } from 'vue';

import type { TaskResponse } from '@/types/response';
import type { ProjectResponse } from '@/types/response';

export function useUpcomingFilters({
  fetchedAllTasks,
  fetchedOverviewProjects,
}: {
  fetchedAllTasks: Ref<TaskResponse[] | null>;
  fetchedOverviewProjects: Ref<ProjectResponse[] | undefined>;
}) {
  // Selected filters state
  const selectedConstructionIds = ref<string[]>([]);
  const selectedProjectIds = ref<string[]>([]);

  const toggleFromList = (list: string[], id: string): string[] => {
    const exists = list.includes(id);
    return exists ? list.filter((x) => x !== id) : [...list, id];
  };

  const toggleConstruction = (id: string) => {
    selectedConstructionIds.value = toggleFromList(selectedConstructionIds.value, id);
  };

  const toggleProject = (id: string) => {
    selectedProjectIds.value = toggleFromList(selectedProjectIds.value, id);
  };

  // Filtered tasks according to selections
  const filteredTasks = computed(() => {
    const all = fetchedAllTasks.value ?? [];
    // Exclude selected projects
    const byProject = selectedProjectIds.value.length
      ? all.filter((t) => !selectedProjectIds.value.includes(t.projectId))
      : all;
    // If no construction exclusions, return as-is
    if (!selectedConstructionIds.value.length) return byProject;
    // Exclude tasks whose project's constructionContainer intersects with selectedConstructionIds
    return byProject.filter((t) => {
      const proj = fetchedOverviewProjects.value?.find((p) => p.id === t.projectId);
      const ids = (proj?.constructionContainer || []).map((c) => c.id);
      return !ids.some((id) => selectedConstructionIds.value.includes(id));
    });
  });

  return {
    selectedConstructionIds,
    selectedProjectIds,
    toggleConstruction,
    toggleProject,
    filteredTasks,
  };
}
