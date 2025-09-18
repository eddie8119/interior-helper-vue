<template>
  <div class="mx-2 min-w-[300px] max-w-[300px] rounded-lg bg-gray-100 p-3 shadow-sm">
    <ContainerHeader
      :construction-name="props.constructionName"
      @update:construction-name="updateConstructionName"
      @delete-container="handleDeleteConstruction"
    />

    <ContainerBody
      :id="props.id"
      :construction-name="props.constructionName"
      :project-id="props.projectId"
      :tasks="tasks"
      @add-task="handleAddNewTask"
      @update:tasks="updateTasks"
    />

    <!-- 添加施作項目按鈕 -->
    <div class="mt-3 flex justify-center">
      <button
        v-if="!isEditing"
        class="flex items-center justify-center rounded-md bg-blue-100 px-3 py-1 text-blue-700 hover:bg-blue-200"
        @click="startEditing"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="mr-1 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
          />
        </svg>
        施作項目
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import type { TaskData } from '@/types/task';
import type { CreateTaskSchema } from '@/utils/schemas/createTaskSchema';

import ContainerBody from '@/components/core/kanbanBoard/ContainerBody.vue';
import ContainerHeader from '@/components/core/kanbanBoard/ContainerHeader.vue';
import { useTaskActions } from '@/composables/useTaskActions';
import { useEditingStateStore } from '@/stores/editingState';

const props = defineProps<{
  id: string;
  constructionName: string;
  projectId: string;
}>();

const emit = defineEmits<{
  (e: 'delete-container'): void;
  (e: 'update:construction-name', name: string): void;
  (e: 'update:tasks', tasks: TaskData[]): void;
}>();

const editingStateStore = useEditingStateStore();

// 初始化任務數據
const tasks = ref<TaskData[]>([]);

// 更新任務容器
const updateTasksContainer = () => {
  // 通知父組件任務已更新
  emit('update:tasks', tasks.value);
};
// Task操作功能
const { addNewTask } = useTaskActions(tasks, updateTasksContainer);

// 使用計算屬性來判斷當前容器是否處於編輯狀態
const isEditing = computed(() => {
  return editingStateStore.isEditing('container', props.id);
});

// 更新任務
const updateTasks = (updatedTasks: TaskData[]) => {
  tasks.value = updatedTasks;
  updateTasksContainer();
};

// 開始編輯任務
const startEditing = () => {
  editingStateStore.startEditing('container', props.id);
};

// 處理容器名稱更新
const updateConstructionName = (newName: string) => {
  emit('update:construction-name', newName);
};

// 處理刪除工程類型
const handleDeleteConstruction = () => {
  emit('delete-container');
};

// 處理添加新任務
const handleAddNewTask = (newTaskData: CreateTaskSchema) => {
  addNewTask(newTaskData);
  updateTasksContainer();
};
</script>
