<template>
  <div class="construction-container" style="overflow: visible">
    <ContainerHeader
      v-model:selected-status="selectedStatus"
      :options="STATUS_FILTER_OPTIONS"
      :construction-name="props.constructionName"
      :tasks-length="filteredAndSortedTasks.length"
      :is-show-status-filter="isShowStatusFilter"
      :task-list-collapsed="taskListCollapsed"
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
      @collapse-change="taskListCollapsed = $event"
    />

    <!-- 添加task按鈕 -->
    <div v-if="!readOnly" class="mt-3 flex justify-center">
      <button
        v-if="!isEditing"
        class="flex appearance-none items-center justify-center rounded-md bg-blue-100 px-3 py-1 text-blue-700 hover:bg-blue-200"
        @click="startEditing"
      >
        <AddIcon /> {{ t('button.add_task') }}
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
import AddIcon from '@/components/ui/AddIcon.vue';
import { STATUS_FILTER_OPTIONS } from '@/constants/selection';
import { useEditingStateStore } from '@/stores/editingState';
import { isWithinDays } from '@/utils/date';
import { searchTasks } from '@/utils/taskSearch';

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
  searchQuery?: string;
  projectTitleList?: Array<{ id: string; title: string }>;
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

// 由 ContainerBody 控制的任務列表摺疊狀態（true=摺疊，false=展開）
const taskListCollapsed = ref<boolean>(false);

const filteredAndSortedTasks = computed(() => {
  let tasksToDisplay: TaskResponse[] = props.tasks;

  // Apply search filter
  if (props.searchQuery && props.searchQuery.trim() !== '') {
    tasksToDisplay = searchTasks(tasksToDisplay, props.searchQuery);
  }

  // Apply status filter
  if (selectedStatus.value !== 'all') {
    tasksToDisplay = tasksToDisplay.filter((task) => task.status === selectedStatus.value);
  }

  // Apply date range filter
  if (props.daysRange) {
    tasksToDisplay = tasksToDisplay.filter((task) => {
      if (!task.endDateTime) return false;
      return isWithinDays(task.endDateTime, props.daysRange[0], props.daysRange[1]);
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
