<template>
  <div
    class="task-card group mb-2 rounded bg-white p-2 shadow-sm transition-colors duration-200 hover:bg-gray-50"
  >
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <DragHandle :size="4" handle-class="task-drag-handle" />
        <h3 class="font-medium">{{ task.title }}</h3>
      </div>
      <TrashButton class="invisible group-hover:visible" @click="handleDeleteTask" />
    </div>
    <p class="mt-1 text-sm text-gray-600">{{ task.description }}</p>

    <!-- 任務詳細資訊 -->
    <div class="mt-2 text-xs text-gray-500">
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

    <!-- 狀態選取 -->
    <div class="mt-2 flex justify-end">
      <el-dropdown trigger="click" @command="updateStatus">
        <button
          class="status-badge flex items-center px-3 py-1.5 transition-all duration-200 hover:shadow-sm"
          :class="statusClass"
        >
          {{ statusText }}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="ml-1.5 h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="todo">
              <div class="flex items-center">
                <div class="mr-3 h-3 w-3 rounded-full bg-gray-400" />
                <span class="text-gray-800">待辦</span>
              </div>
            </el-dropdown-item>
            <el-dropdown-item command="in_progress">
              <div class="flex items-center">
                <div class="mr-3 h-3 w-3 rounded-full bg-blue-400" />
                <span class="text-blue-800">進行中</span>
              </div>
            </el-dropdown-item>
            <el-dropdown-item command="completed">
              <div class="flex items-center">
                <div class="mr-3 h-3 w-3 rounded-full bg-green-400" />
                <span class="text-green-800">已完成</span>
              </div>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { TaskResponse } from '@/types/response';

import DeleteDialog from '@/components/core/dialog/DeleteDialog.vue';
import DragHandle from '@/components/ui/DragHandle.vue';
import TrashButton from '@/components/ui/TrashButton.vue';
import { useTaskContext } from '@/composables/todo/useTaskContext';

const props = defineProps<{
  task: TaskResponse;
}>();

const emit = defineEmits<{
  (e: 'update:status', taskId: string, status: string): void;
  (e: 'task-drop', dropData: any): void;
}>();

// 從上下文中獲取任務操作
const { deleteTask } = useTaskContext();

// 處理刪除任務
const handleDeleteTask = () => {
  deleteTask(props.task.id);
};

// 更新任務狀態
const updateStatus = (status: string) => {
  emit('update:status', props.task.id, status);
};

// 格式化日期
const formatDate = (dateString: string | Date | number | null) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
};

// 計算狀態樣式
const statusClass = computed(() => {
  switch (props.task.status) {
    case 'completed':
      return 'bg-green-100 text-green-700';
    case 'in_progress':
      return 'bg-blue-100 text-blue-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
});

// 計算狀態文字
const statusText = computed(() => {
  switch (props.task.status) {
    case 'completed':
      return '已完成';
    case 'in_progress':
      return '進行中';
    default:
      return '待辦';
  }
});
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
