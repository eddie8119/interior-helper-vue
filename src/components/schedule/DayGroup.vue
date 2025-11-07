<template>
  <!-- Break Line for Non-Consecutive Dates -->
  <div v-if="showBreakLine" class="break-line-vertical" />

  <div :ref="setDayRef" class="day-section">
    <!-- Date Header -->
    <div class="sticky top-0 z-10 mb-4 pb-2">
      <div class="flex items-baseline gap-4">
        <h2 class="text-color-difference text-6xl font-bold">
          {{ group.day }}
        </h2>
        <div class="flex flex-col">
          <span class="font-medium text-secondary-red">{{ group.weekDay }}</span>
          <span class="text200-color-difference text-sm">{{ group.monthYear }}</span>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap gap-3">
      <TaskCardItem
        v-for="task in group.tasks"
        :key="task.id"
        :task="task"
        :expanded="expandedTaskIds.has(task.id)"
        @update:expanded="(value) => updateTaskExpanded(task.id, value)"
        @update:task="handleUpdateTask"
        @delete="handleDeleteTask"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import TaskCardItem from './TaskCardItem.vue';

import type { TaskResponse } from '@/types/response';
import type { DayGroup as DayGroupType } from '@/utils/scheduleGroupUtils';

const props = defineProps<{
  group: DayGroupType;
  showBreakLine: boolean;
  expandedTaskIds: Set<string>;
}>();

const emit = defineEmits<{
  (e: 'update:expanded', taskId: string, value: boolean): void;
  (e: 'update:task', taskId: string, patch: Partial<TaskResponse>): void;
  (e: 'delete', taskId: string): void;
  (e: 'set-ref', dateKey: string, el: HTMLElement): void;
}>();

const dayRef = ref<HTMLElement | null>(null);

const setDayRef = (el: HTMLElement | null) => {
  if (el) {
    dayRef.value = el as HTMLElement;
    emit('set-ref', props.group.dateKey, el);
  }
};

const updateTaskExpanded = (taskId: string, value: boolean) => {
  emit('update:expanded', taskId, value);
};

const handleUpdateTask = (taskId: string, patch: Partial<TaskResponse>) => {
  emit('update:task', taskId, patch);
};

const handleDeleteTask = (taskId: string) => {
  emit('delete', taskId);
};
</script>

<style scoped>
.day-section {
  scroll-margin-top: 20px;
}
</style>
