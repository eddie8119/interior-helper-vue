<template>
  <div class="mx-2 min-w-[300px] max-w-[300px] rounded-lg bg-gray-100 p-3 shadow-sm">
    <ContainerHeader
      :construction-name="props.constructionName"
      @update:construction-name="updateConstructionName"
      @delete-container="handleDeleteConstruction"
    />

    <ContainerBody
      :construction-id="props.constructionId"
      :project-id="props.projectId"
      :tasks="filteredTasks"
      @update:tasks="updateTasks"
      @task-drop="handleTaskDrop"
    />

    <!-- 添加task按鈕 -->
    <div class="mt-3 flex justify-center">
      <button
        v-if="!isEditing"
        class="flex items-center justify-center rounded-md bg-blue-100 px-3 py-1 text-blue-700 hover:bg-blue-200"
        @click="startEditing"
      >
        + 施作任務
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';

import type { TaskResponse } from '@/types/response';

import ContainerBody from '@/components/core/kanbanBoard/ContainerBody.vue';
import ContainerHeader from '@/components/core/kanbanBoard/ContainerHeader.vue';
import { useEditingStateStore } from '@/stores/editingState';

const props = defineProps<{
  constructionId: string;
  constructionName: string;
  projectId: string;
  filteredTasks: TaskResponse[];
}>();

const emit = defineEmits<{
  // container events
  (e: 'delete-container'): void;
  (e: 'update:construction-name', name: string): void;
  // task events
  (e: 'task-drop', dropResult: any, constructionType: string): void;
}>();

const editingStateStore = useEditingStateStore();

// 使用計算屬性來判斷當前容器是否處於編輯狀態
const isEditing = computed(() => {
  return editingStateStore.isEditing('container', props.constructionId);
});

// Watch for changes in the global editing state
watch(
  () => editingStateStore.currentEditingState,
  (newState) => {
    // If this component is in edit mode, but the global state has changed to another component,
    // cancel the edit for this component.
    if (
      isEditing.value &&
      (newState.type !== 'container' || newState.id !== props.constructionId)
    ) {
      editingStateStore.stopEditing();
    }
  },
  { deep: true }
);

// 處理任務拖曳
const handleTaskDrop = (dropResult: any) => {
  emit('task-drop', dropResult, props.constructionName);
};

// 開始編輯任務
const startEditing = () => {
  editingStateStore.startEditing('container', props.constructionId);
};

// 處理容器名稱更新
const updateConstructionName = (newName: string) => {
  emit('update:construction-name', newName);
};

// 處理刪除工程類型
const handleDeleteConstruction = () => {
  emit('delete-container');
};

// 更新任務
const updateTasks = (dropResult: any) => {
  // 直接將從 ContainerBody 收到的 dropResult 轉發給父組件
  emit('task-drop', dropResult, props.constructionName);
};
</script>
