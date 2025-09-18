<template>
  <div>
    <!-- 空容器提示 -->
    <div
      v-if="!isEditing"
      class="flex h-[100px] items-center justify-center rounded-md border border-gray-200 bg-white"
    >
      <span class="text-gray-400">尚無施作項目</span>
    </div>

    <div v-else-if="isEditing">
      <AddNewTask
        :construction-name="constructionName"
        :project-id="projectId"
        @add-task="handleAddNewTask"
        @close="stopEditing"
      />
    </div>

    <div v-else>
      <TaskList :tasks="tasks" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { TaskData } from '@/types/task';
import type { CreateTaskSchema } from '@/utils/schemas/createTaskSchema';

import AddNewTask from '@/components/core/kanbanBoard/AddNewTask.vue';
import TaskList from '@/components/core/kanbanBoard/TaskList.vue';
import { useEditingStateStore } from '@/stores/editingState';

const props = defineProps<{
  id: string;
  constructionName: string;
  projectId: string;
  tasks: TaskData[];
}>();

const emit = defineEmits<{
  (e: 'add-task', newTaskData: CreateTaskSchema): void;
  (e: 'update:tasks', tasks: TaskData[]): void;
}>();

const editingStateStore = useEditingStateStore();

// 使用計算屬性來判斷當前容器是否處於編輯狀態
const isEditing = computed(() => {
  return editingStateStore.isEditing('container', props.id);
});

// 停止編輯任務
const stopEditing = () => {
  editingStateStore.stopEditing();
};

// 處理添加新任務
const handleAddNewTask = (newTaskData: CreateTaskSchema) => {
  emit('add-task', newTaskData);
  stopEditing();
};
</script>
