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
import { useOverviewSources } from '@/composables/useOverviewSources';
import { useTasks } from '@/composables/useTasks';
import { useUpcomingFilters } from '@/composables/useUpcomingFilters';
import { provideTaskCardFilter } from '@/context/useTaskCardFilter';
import { TaskTimeCondition } from '@/types/task';

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
    case TaskTimeCondition.UNSCHEDULED:
      return fetchedAllTasks.value.filter((task: TaskResponse) => {
        const endDateTime = task.endDateTime ? new Date(task.endDateTime) : null;
        const reminderDateTime = task.reminderDateTime ? new Date(task.reminderDateTime) : null;
        return !endDateTime && !reminderDateTime;
      });
    case TaskTimeCondition.OVERDUE:
      return fetchedAllTasks.value.filter((task: TaskResponse) => {
        const endDateTime = task.endDateTime ? new Date(task.endDateTime) : null;
        const reminderDateTime = task.reminderDateTime ? new Date(task.reminderDateTime) : null;
        return (endDateTime && endDateTime < now) || (reminderDateTime && reminderDateTime < now);
      });
    case TaskTimeCondition.TODAY:
      return fetchedAllTasks.value.filter((task: TaskResponse) => {
        const endDateTime = task.endDateTime ? new Date(task.endDateTime) : null;
        const reminderDateTime = task.reminderDateTime ? new Date(task.reminderDateTime) : null;
        const isEndToday = !!endDateTime && endDateTime >= today && endDateTime <= endOfToday;
        const isReminderToday =
          !!reminderDateTime && reminderDateTime >= today && reminderDateTime <= endOfToday;
        return isEndToday || isReminderToday;
      });
    case TaskTimeCondition.THIS_WEEK: {
      const day = today.getDay();
      const daysUntilSunday = (7 - day) % 7;
      const endOfWeek = new Date(today);
      endOfWeek.setDate(today.getDate() + daysUntilSunday);
      endOfWeek.setHours(23, 59, 59, 999);
      return fetchedAllTasks.value.filter((task: TaskResponse) => {
        const endDateTime = task.endDateTime ? new Date(task.endDateTime) : null;
        const reminderDateTime = task.reminderDateTime ? new Date(task.reminderDateTime) : null;
        const isEndInRange = !!endDateTime && endDateTime >= today && endDateTime <= endOfWeek;
        const isReminderInRange =
          !!reminderDateTime && reminderDateTime >= today && reminderDateTime <= endOfWeek;
        return isEndInRange || isReminderInRange;
      });
    }
    case TaskTimeCondition.THIS_MONTH: {
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
      return fetchedAllTasks.value.filter((task: TaskResponse) => {
        const endDateTime = task.endDateTime ? new Date(task.endDateTime) : null;
        const reminderDateTime = task.reminderDateTime ? new Date(task.reminderDateTime) : null;
        const isEndInRange = !!endDateTime && endDateTime >= today && endDateTime <= endOfMonth;
        const isReminderInRange =
          !!reminderDateTime && reminderDateTime >= today && reminderDateTime <= endOfMonth;
        return isEndInRange || isReminderInRange;
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
