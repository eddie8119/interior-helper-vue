<template>
  <div
    v-if="!isEditing"
    class="task-card group cursor-pointer rounded-md bg-white p-1 shadow-sm duration-200"
    @dblclick="startEditing"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <DragHandle :size="4" handle-class="task-drag-handle" />
        <H3Title :title="task.title" />
      </div>
      <div class="flex items-center">
        <TaskStatusDropdown class="mr-1" :status="task.status" @update:status="handleTaskStatusChange" />
        <TrashButton class="invisible group-hover:visible" @click="handleDeleteTask" />
      </div>
    </div>
    <div class="p-2">
      <p class="mt-1 text-lg text-gray-600">{{ task.description }}</p>
      <div class="mt-2 text-gray-500">
        <div v-if="task.reminderDatetime" class="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="mr-1 h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span>{{ formatDate(task.reminderDatetime) }}</span>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="rounded-md border p-2">
    <TaskForm
      :initial-data="task"
      :show-more="true"
      :construction-id="task.constructionType"
      :errors="{}"
      :error-message="errorMessage"
      :on-save="onUpdateTask"
      :on-cancel="cancelEditing"
    />
  </div>
</template>

<script setup lang="ts">
import { useForm } from 'vee-validate';
import { ref } from 'vue';

import type { TaskResponse } from '@/types/response';
import type { TaskStatus } from '@/types/task';

import DragHandle from '@/components/ui/DragHandle.vue';
import TrashButton from '@/components/ui/TrashButton.vue';
import H3Title from '@/components/core/title/H3Title.vue';
import TaskForm from '@/components/core/kanbanBoard/TaskForm.vue';
import TaskStatusDropdown from '@/components/ui/TaskStatusDropdown.vue';
import { useTaskContext } from '@/context/useTaskContext';
import { taskApi } from '@/api/task';

const props = defineProps<{
  task: TaskResponse;
}>();

// const emit = defineEmits<{
//   (e: 'update:status', taskId: string, status: 'todo' | 'inProgress' | 'done'): void;
//   (e: 'task-drop', dropData: any): void;
// }>();

// 從上下文中獲取任務操作
const { deleteTask, updateTask } = useTaskContext();

const isEditing = ref(false);
const { values, setValues } = useForm<Partial<TaskResponse>>();
const errorMessage = ref<string>('');

const startEditing = () => {
  setValues({
    title: props.task.title,
    description: props.task.description,
    reminderDatetime: props.task.reminderDatetime,
    materials: props.task.materials,
  });
  isEditing.value = true;
};

const cancelEditing = () => {
  isEditing.value = false;
};

const onUpdateTask = async() => {
  try {
    const { success, message, data } = await taskApi.updateTask(props.task.id, values);
    if (success) {
      updateTask(props.task.id, data);
      isEditing.value = false;
    }
    if (!success) {
      errorMessage.value = message;
      return;
    }
  } catch (error) {
    console.error('Failed to update task:', error);
  }
};

// 處理刪除任務
const handleDeleteTask = async () => {
  const { success } = await taskApi.deleteTask(props.task.id);
  if (success) {
    deleteTask(props.task.id);
  }
};

// 更新任務狀態
const handleTaskStatusChange = async (status: TaskStatus) => {
  try {
    const { success, message, data } = await taskApi.updateTask(props.task.id, { ...props.task, status });
    if (success) {
      updateTask(props.task.id, data);
    }
    if (!success) {
      errorMessage.value = message;
      return;
    }
  } catch (error) {
    console.error('Failed to update task:', error);
  }
};

// 格式化日期
const formatDate = (dateString: string | Date | number | null) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
};
</script>

<style scoped>
.status-badge {
  font-size: 0.95rem;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
}

.task-card {
  transition: all 0.2s ease;
}

.task-card:hover {
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
</style>
