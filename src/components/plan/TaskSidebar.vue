<template>
  <div class="flex h-full flex-col">
    <!-- 標題 -->
    <div class="p-3">
      <PillTab :model-value="activeTab" :tabs="tabs" @update:model-value="activeTab = $event">
        <template #item="{ tab }">
          {{ t(`tab.tasks.${tab.value}`) }}
        </template>
      </PillTab>
    </div>
    <!-- 任務列表 -->
    <div class="flex-1 overflow-y-auto p-4">
      <div v-if="!filteredTasks || filteredTasks.length === 0" class="text-center text-gray-500">
        <ElIcon :size="32">
          <DocumentRemove />
        </ElIcon>
        <p>暫無任務</p>
      </div>

      <div v-else class="space-y-3">
        <TaskSidebarCard
          v-for="task in filteredTasks"
          :key="task.id"
          :task="task"
          :is-linked="isTaskLinked(task.id)"
          :is-selected="isTaskSelected(task.id)"
          :is-highlighted="highlightedTaskId === task.id"
          :is-pinning="isPinning"
          :pinning-task-id="pinningTaskId"
          @select="handleTaskSelect(task.id)"
          @link-to-marker="$emit('link-task-to-marker', task.id)"
          @create-marker="$emit('create-marker-for-task', task.id)"
          @remove-pin="$emit('remove-task-pin', task.id)"
          @cancel-marker="$emit('cancel-marker-for-task', task.id)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DocumentRemove } from '@element-plus/icons-vue';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import TaskSidebarCard from './TaskSidebarCard.vue';

import type { TaskResponse } from '@/types/response';
import type { TaskMarker } from '@/utils/floorPlan/floorPlanMarker';

import PillTab from '@/components/core/tab/PillTab.vue';
import { useTaskHighlight } from '@/composables/floorPlan/useTaskHighlight';
import { TASK_PIN_CONDITION_TAB_LIST } from '@/constants/tab';
import { TaskPinCondition } from '@/types/task';

// Props and Emits
const props = defineProps<{
  tasks: TaskResponse[] | null;
  taskMarkers: TaskMarker[];
  selectedMarkerId: string | null;
  isPinning: boolean;
  pinningTaskId: string | null;
}>();

const emit = defineEmits<{
  (e: 'select-task', taskId: string): void;
  (e: 'link-task-to-marker', taskId: string): void;
  (e: 'create-marker-for-task', taskId: string): void;
  (e: 'remove-task-pin', taskId: string): void;
  (e: 'cancel-marker-for-task', taskId: string): void;
}>();

// Composable and i18n
const { t } = useI18n();
const { highlightedTaskId, highlightTemporarily } = useTaskHighlight();

// Tab state
const activeTab = ref<TaskPinCondition>(TaskPinCondition.WITHOUT_PIN);

const tabs = computed(() => TASK_PIN_CONDITION_TAB_LIST.map((tab) => ({ value: tab.name })));

// Filtered tasks based on active tab
const filteredTasks = computed(() => {
  if (!props.tasks) return null;

  return props.tasks.filter((task) => {
    if (activeTab.value === TaskPinCondition.WITH_PIN) return task.pinLocation;
    if (activeTab.value === TaskPinCondition.WITHOUT_PIN) return !task.pinLocation;
    return true; // 'all' tab
  });
});

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

const handleTaskSelect = (taskId: string) => {
  highlightTemporarily(taskId);
  emit('select-task', taskId);
};
</script>
