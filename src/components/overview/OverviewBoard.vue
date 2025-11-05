<template>
  <Loading v-if="isLoadingAllTasks || isLoadingOverviewProjects" />
  <div v-else>
    <OverviewTaskFilterBar
      :construction-list="constructionList"
      :project-title-list="projectTitleList"
      :selected-construction-ids="selectedConstructionIds"
      :selected-project-ids="selectedProjectIds"
      @toggle-construction="toggleConstruction"
      @toggle-project="toggleProject"
    />
    <OverviewTab v-model:task-time-condition="taskTimeCondition" />
    <OverviewContent
      :filtered-construction-list="filteredConstructionList"
      :filtered-tasks="filteredTasks"
      :project-title-list="projectTitleList"
    />
  </div>
</template>

<script setup lang="ts">
import Loading from '@/components/core/loading/Loading.vue';
import OverviewContent from '@/components/overview/OverviewContent.vue';
import OverviewTab from '@/components/overview/OverviewTab.vue';
import OverviewTaskFilterBar from '@/components/overview/OverviewTaskFilterBar.vue';
import { useOverviewSources } from '@/composables/useOverviewSources';
import { useTasks } from '@/composables/useTasks';
import { useUpcomingFilters } from '@/composables/useUpcomingFilters';
import { provideTaskCardFilter } from '@/context/useTaskCardFilter';
import { computed, ref } from 'vue';
import { TaskTimeCondition } from '@/types/task';
import type { TaskResponse } from '@/types/response';

const taskTimeCondition = ref<TaskTimeCondition>(TaskTimeCondition.ALL);

const { fetchedAllTasks, isLoadingAllTasks } = useTasks();
const { fetchedOverviewProjects, isLoadingOverviewProjects, constructionList, projectTitleList } =
  useOverviewSources();

const fetchedTasksTimeCondition = computed(() => {
  if (!fetchedAllTasks.value) return [];

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    23,
    59,
    59,
    999
  );

  switch (taskTimeCondition.value) {
    case TaskTimeCondition.ALL:
      return fetchedAllTasks.value;
    case TaskTimeCondition.OVERDUE:
      return fetchedAllTasks.value.filter((task: TaskResponse) => {
        const endDate = task.endDate ? new Date(task.endDate) : null;
        const reminderDate = task.reminderDatetime ? new Date(task.reminderDatetime) : null;
        return (endDate && endDate < now) || (reminderDate && reminderDate < now);
      });
    case TaskTimeCondition.TODAY:
      return fetchedAllTasks.value.filter((task: TaskResponse) => {
        if (!task.endDate) return false;
        const endDate = new Date(task.endDate);
        return endDate >= today && endDate <= endOfToday;
      });
    case TaskTimeCondition.THIS_WEEK: {
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + 7);
      return fetchedAllTasks.value.filter((task: TaskResponse) => {
        if (!task.endDate) return false;
        const endDate = new Date(task.endDate);
        return endDate >= today && endDate < endOfWeek;
      });
    }
    case TaskTimeCondition.THIS_MONTH: {
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
      return fetchedAllTasks.value.filter((task: TaskResponse) => {
        if (!task.endDate) return false;
        const endDate = new Date(task.endDate);
        return endDate >= today && endDate <= endOfMonth;
      });
    }
    default:
      return fetchedAllTasks.value;
  }
});

const {
  selectedConstructionIds,
  selectedProjectIds,
  toggleConstruction,
  toggleProject,
  filteredTasks,
  filteredConstructionList,
} = useUpcomingFilters({
  fetchedAllTasks: fetchedTasksTimeCondition,
  fetchedOverviewProjects,
  constructionList,
});

provideTaskCardFilter();
</script>

<style scoped></style>
