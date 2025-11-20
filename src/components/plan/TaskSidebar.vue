<template>
  <div class="flex h-full flex-col">
    <!-- 標題 -->
    <div class="border-b border-gray-200 p-3">
      <H3Title :title="t('title.task_list')" />
    </div>

    <!-- 任務列表 -->
    <div class="flex-1 overflow-y-auto p-4">
      <div v-if="!tasks || tasks.length === 0" class="text-center text-gray-500">
        <div class="mb-4">
          <svg
            class="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
        <p>暫無任務</p>
      </div>

      <div v-else class="space-y-3">
        <TaskSidebarCard
          v-for="task in tasks"
          :key="task.id"
          :task="task"
          :is-linked="isTaskLinked(task.id)"
          :is-selected="isTaskSelected(task.id)"
          @select="$emit('select-task', task.id)"
          @link-to-marker="$emit('link-task-to-marker', task.id)"
          @create-marker="$emit('create-marker-for-task', task.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import TaskSidebarCard from './TaskSidebarCard.vue';

import type { TaskResponse } from '@/types/response';
import type { TaskMarker } from '@/utils/floorPlan/floorPlanMarker';

import H3Title from '@/components/core/title/H3Title.vue';

const props = defineProps<{
  tasks: TaskResponse[] | null;
  taskMarkers: TaskMarker[];
  selectedMarkerId: string | null;
}>();

defineEmits<{
  (e: 'select-task', taskId: string): void;
  (e: 'link-task-to-marker', taskId: string): void;
  (e: 'create-marker-for-task', taskId: string): void;
}>();

const { t } = useI18n();

// 檢查任務是否已連結到標記
const isTaskLinked = (taskId: string) => {
  return props.taskMarkers.some((marker) => marker.taskId === taskId);
};

// 檢查任務對應的標記是否被選中
const isTaskSelected = (taskId: string) => {
  if (!props.selectedMarkerId) return false;
  const marker = props.taskMarkers.find((marker) => marker.taskId === taskId);
  return marker?.id === props.selectedMarkerId;
};
</script>
