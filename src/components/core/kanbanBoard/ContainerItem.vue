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
      @add-task="addNewTask"
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
import { computed } from 'vue';
import { onMounted } from 'vue';

import { taskApi } from '@/api/task';
import type { TaskData } from '@/types/task';
import type { CreateTaskSchema } from '@/utils/schemas/createTaskSchema';
import type { TaskResponse } from '@/types/response';

import ContainerBody from '@/components/core/kanbanBoard/ContainerBody.vue';
import ContainerHeader from '@/components/core/kanbanBoard/ContainerHeader.vue';
import { useTaskActions } from '@/composables/todo/useTaskActions';
import { useEditingStateStore } from '@/stores/editingState';
import { useDraggableTasks } from '@/composables/todo/useDraggableTasks';
import { getTaskStorageKey } from '@/utils/storage/taskStorage';

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

// 使用 useDraggableTasks 管理任務拖拉和本地儲存
const { tasks, initializeTask, updateTask } = useDraggableTasks(props, emit);

// 初始化任務數據
onMounted(async () => {
  // 嘗試從本地存儲加載任務數據
  const storageKey = getTaskStorageKey(props.projectId);
  const storedData = localStorage.getItem(storageKey);

  if (storedData) {
    try {
      const parsedData = JSON.parse(storedData);
      if (Array.isArray(parsedData) && parsedData.length > 0) {
        // 篩選出屬於當前工程類型的任務
        const filteredTasks = parsedData.filter((task) => task.type === props.constructionName);

        if (filteredTasks.length > 0) {
          tasks.value = filteredTasks;
        }
      }
    } catch (error) {
      console.error('讀取本地任務數據失敗:', error);
    }
  }

  // 如果本地沒有數據，嘗試從 API 獲取
  if (tasks.value.length === 0) {
    try {
    } catch (error) {
      console.error('獲取任務數據失敗:', error);
    }
  }
});

const editingStateStore = useEditingStateStore();

// 更新任務容器
const updateTasksContainer = () => {
  // 通知父組件任務已更新
  emit('update:tasks', tasks.value);
  // 使用 useDraggableTasks 中的 updateTask 方法保存到本地存儲
  updateTask();
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
</script>
