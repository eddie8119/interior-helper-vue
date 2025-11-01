import { computed, ref, type Ref } from 'vue';

import type { TaskResponse } from '@/types/response';
import type { ProjectResponse } from '@/types/response';
import type { ConstructionSelection } from '@/types/selection';

export function useUpcomingFilters({
  fetchedAllTasks,
  fetchedOverviewProjects: _fetchedOverviewProjects,
  constructionList,
}: {
  fetchedAllTasks: Ref<TaskResponse[] | null>;
  fetchedOverviewProjects: Ref<ProjectResponse[] | undefined>;
  constructionList: Ref<ConstructionSelection[] | null>;
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
    // 將沒有reminderDatetime的任務過濾掉 總覽只顯示有提醒的任務
    const all = (fetchedAllTasks.value ?? []).filter((t) => t.reminderDatetime !== null);

    // Exclude selected projects
    const byProject = selectedProjectIds.value.length
      ? all.filter((t) => !selectedProjectIds.value.includes(t.projectId))
      : all;
    // If no construction filters selected, return as-is
    if (!selectedConstructionIds.value.length) return byProject;
    // Exclude tasks whose constructionType is in selectedConstructionIds
    return byProject.filter((t) => !selectedConstructionIds.value.includes(t.constructionType));
  });

  const filteredConstructionList = computed(() => {
    const all = constructionList.value ?? [];
    return all.filter((c) => !selectedConstructionIds.value.includes(c.id));
  });

  return {
    selectedConstructionIds,
    selectedProjectIds,
    toggleConstruction,
    toggleProject,
    filteredTasks,
    filteredConstructionList,
  };
}
