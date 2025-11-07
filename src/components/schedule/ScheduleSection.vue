<template>
  <Loading v-if="isLoadingAllTasks || isLoadingOverviewProjects" />
  <div v-else class="flex h-full gap-4">
    <!-- Left Sidebar -->
    <div class="flex w-80 flex-shrink-0 flex-col gap-4 overflow-hidden">
      <div class="overflow-hidden">
        <ScheduleCalendar
          :selected-date="selectedDate"
          :task-dates="taskDates"
          @update:selected-date="selectedDate = $event"
        />
      </div>

      <div class="flex-1 overflow-y-auto">
        <ScheduleFilterArea
          :construction-list="constructionList"
          :project-title-list="projectTitleList"
          :selected-construction-ids="selectedConstructionIds"
          :selected-project-ids="selectedProjectIds"
          @toggle-construction="toggleConstruction"
          @toggle-project="toggleProject"
        />
      </div>
    </div>

    <!-- Right Content - Daily View -->
    <div class="panel-container relative h-full flex-1 overflow-hidden">
      <ScheduleDailyView
        :tasks="filteredTasks"
        :selected-date="selectedDate"
        @update:task="handleUpdateTask"
        @delete="handleDeleteTask"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TaskResponse } from '@/types/response';

import Loading from '@/components/core/loading/Loading.vue';
import ScheduleCalendar from '@/components/schedule/ScheduleCalendar.vue';
import ScheduleDailyView from '@/components/schedule/ScheduleDailyView.vue';
import ScheduleFilterArea from '@/components/schedule/ScheduleFilterArea.vue';
import { useOverviewSources } from '@/composables/useOverviewSources';
import { useSchedule } from '@/composables/useSchedule';
import { useTasks } from '@/composables/useTasks';
import { provideProjectTitleList } from '@/context/useProjectTitleList';
import { provideTaskCardFilter } from '@/context/useTaskCardFilter';

// Fetch data
const { fetchedAllTasks, isLoadingAllTasks, updateTask, deleteTask } = useTasks();
const { fetchedOverviewProjects, isLoadingOverviewProjects, constructionList, projectTitleList } =
  useOverviewSources();

// Schedule logic
const {
  selectedDate,
  selectedConstructionIds,
  selectedProjectIds,
  toggleConstruction,
  toggleProject,
  filteredTasks,
  taskDates,
} = useSchedule({
  fetchedAllTasks,
  fetchedOverviewProjects,
  constructionList,
});

// Provide contexts
provideTaskCardFilter();
provideProjectTitleList(projectTitleList);

// Task handlers
const handleUpdateTask = async (taskId: string, patch: Partial<TaskResponse>) => {
  await updateTask(taskId, patch);
};

const handleDeleteTask = async (taskId: string) => {
  await deleteTask(taskId);
};
</script>

<style scoped></style>
