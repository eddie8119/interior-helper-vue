<template>
  <div class="construction-container" style="overflow: visible">
    <ContainerHeader
      v-model:selected-status="selectedStatus"
      :options="STATUS_FILTER_OPTIONS"
      :construction-name="props.constructionName"
      :tasks-length="filteredAndSortedTasks.length"
      :is-show-status-filter="isShowStatusFilter"
      :read-only="readOnly"
      @update:construction-name="updateConstructionName"
      @delete-container="handleDeleteConstruction"
    />

    <ContainerBody
      :construction-id="props.constructionId"
      :project-id="props.projectId"
      :tasks="filteredAndSortedTasks"
      :read-only="readOnly"
      @update:tasks="updateTasks"
      @task-drop="handleTaskDrop"
    />

    <!-- 添加task按鈕 -->
    <div v-if="!readOnly" class="mt-3 flex justify-center">
      <button
        v-if="!isEditing"
        class="flex items-center justify-center rounded-md bg-blue-100 px-3 py-1 text-blue-700 hover:bg-blue-200"
        @click="startEditing"
      >
        + {{ t('button.add_task') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { TaskFilterStatus } from '@/constants/selection';
import type { EditingState } from '@/stores/editingState';
import type { TaskResponse } from '@/types/response';

import ContainerBody from '@/components/kanbanBoard/ContainerBody.vue';
import ContainerHeader from '@/components/kanbanBoard/ContainerHeader.vue';
import { STATUS_FILTER_OPTIONS } from '@/constants/selection';
import { useEditingStateStore } from '@/stores/editingState';
import { isWithinDays } from '@/utils/date';

declare module '@/types/response' {
  interface TaskResponse {
    order?: number;
  }
}

const props = defineProps<{
  constructionId: string;
  constructionName: string;
  projectId: string;
  tasks: TaskResponse[];
  daysRange: [number, number] | null;
  readOnly?: boolean;
}>();

const emit = defineEmits<{
  (e: 'delete-container'): void;
  (e: 'update:construction-name', name: string): void;
  (e: 'task-drop', dropResult: any, constructionType: string): void;
  (e: 'update:tasks', tasks: TaskResponse[]): void;
}>();

const editingStateStore = useEditingStateStore();
const { t } = useI18n();

const isEditing = computed(() => {
  return editingStateStore.isEditing('container', props.constructionId);
});

const selectedStatus = ref<TaskFilterStatus>('all');

const filteredAndSortedTasks = computed(() => {
  let tasksToDisplay: TaskResponse[] = props.tasks;

  if (selectedStatus.value !== 'all') {
    tasksToDisplay = tasksToDisplay.filter((task) => task.status === selectedStatus.value);
  }

  if (props.daysRange) {
    tasksToDisplay = tasksToDisplay.filter((task) => {
      if (!task.endDate) return false;
      return isWithinDays(task.endDate, props.daysRange[0], props.daysRange[1]);
    });
  }

  return tasksToDisplay.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
});

const isShowStatusFilter = computed(() => {
  return props.tasks.some((task) => task.status !== 'todo');
});

watch(
  () => editingStateStore.currentEditingState,
  (newState: EditingState | null) => {
    // If another component is being edited, stop editing this container
    if (
      newState &&
      newState.type === 'container' &&
      newState.id !== props.constructionId &&
      isEditing.value
    ) {
      editingStateStore.stopEditing();
    }
  },
  { deep: true }
);

const handleTaskDrop = (dropResult: any) => {
  emit('task-drop', dropResult, props.constructionName);
};

const startEditing = () => {
  editingStateStore.startEditing('container', props.constructionId);
};

const updateConstructionName = (name: string) => {
  emit('update:construction-name', name);
};

const handleDeleteConstruction = () => {
  emit('delete-container');
};

const updateTasks = (tasks: TaskResponse[]) => {
  emit('update:tasks', tasks);
};
</script>
