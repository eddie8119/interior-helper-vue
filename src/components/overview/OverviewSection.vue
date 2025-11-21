<template>
  <Loading v-if="isLoadingAllTasks || isLoadingOverviewProjects" />
  <div v-else>
    <OverviewTaskFilterArea
      :construction-list="constructionList"
      :project-title-list="projectTitleList"
      :selected-construction-ids="selectedConstructionIds"
      :selected-project-ids="selectedProjectIds"
      @toggle-construction="toggleConstruction"
      @toggle-project="toggleProject"
    />
    <OverviewTab v-model:task-time-condition="taskTimeCondition" class="mt-6" />
    <OverviewContent
      :filtered-construction-list="filteredConstructionList"
      :filtered-tasks="filteredTasks"
      :project-title-list="projectTitleList"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import type { TaskResponse } from '@/types/response';

import Loading from '@/components/core/loading/Loading.vue';
import OverviewContent from '@/components/overview/OverviewContent.vue';
import OverviewTab from '@/components/overview/OverviewTab.vue';
import OverviewTaskFilterArea from '@/components/overview/OverviewTaskFilterArea.vue';
import { useTasks } from '@/composables/query/useTasks';
import { useOverviewSources } from '@/composables/useOverviewSources';
import { useUpcomingFilters } from '@/composables/useUpcomingFilters';
import { provideTaskCardFilter } from '@/context/useTaskCardFilter';
import { TaskTimeCondition } from '@/types/task';

const taskTimeCondition = ref<TaskTimeCondition>(TaskTimeCondition.ALL);

const { fetchedAllTasks, isLoadingAllTasks } = useTasks();
const { fetchedOverviewProjects, isLoadingOverviewProjects, constructionList, projectTitleList } =
  useOverviewSources();

const filterTasksByTime = (
  tasks: TaskResponse[],
  startTime: Date,
  endTime: Date,
  excludeDone = true
) => {
  return tasks.filter((task) => {
    if (excludeDone && task.status === 'done') return false;
    const endDateTime = task.endDateTime ? new Date(task.endDateTime) : null;
    const reminderDateTime = task.reminderDateTime ? new Date(task.reminderDateTime) : null;
    const isEndInRange = !!endDateTime && endDateTime >= startTime && endDateTime <= endTime;
    const isReminderInRange =
      !!reminderDateTime && reminderDateTime >= startTime && reminderDateTime <= endTime;
    return isEndInRange || isReminderInRange;
  });
};

const fetchedTasksTimeCondition = computed(() => {
  if (!fetchedAllTasks.value) return [];

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (taskTimeCondition.value) {
    case TaskTimeCondition.ALL:
      return fetchedAllTasks.value;
    case TaskTimeCondition.UNSCHEDULED:
      return fetchedAllTasks.value.filter((task: TaskResponse) => {
        const endDateTime = task.endDateTime ? new Date(task.endDateTime) : null;
        const reminderDateTime = task.reminderDateTime ? new Date(task.reminderDateTime) : null;
        return !endDateTime && !reminderDateTime;
      });
    case TaskTimeCondition.OVERDUE:
      return fetchedAllTasks.value.filter((task: TaskResponse) => {
        if (task.status === 'done') return false;
        const endDateTime = task.endDateTime ? new Date(task.endDateTime) : null;
        const reminderDateTime = task.reminderDateTime ? new Date(task.reminderDateTime) : null;
        return (endDateTime && endDateTime < now) || (reminderDateTime && reminderDateTime < now);
      });
    case TaskTimeCondition.TODAY: {
      const endOfToday = new Date(today);
      endOfToday.setHours(23, 59, 59, 999);
      return filterTasksByTime(fetchedAllTasks.value, today, endOfToday);
    }
    case TaskTimeCondition.THIS_WEEK: {
      const endOfWeek = new Date(today);
      const day = today.getDay();
      const daysUntilSunday = (7 - day) % 7;
      endOfWeek.setDate(today.getDate() + daysUntilSunday);
      endOfWeek.setHours(23, 59, 59, 999);
      return filterTasksByTime(fetchedAllTasks.value, today, endOfWeek);
    }
    case TaskTimeCondition.THIS_MONTH: {
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
      return filterTasksByTime(fetchedAllTasks.value, today, endOfMonth);
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
