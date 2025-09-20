<template>
  <div class="task-card mb-2 cursor-move rounded bg-white p-2 shadow-sm">
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <!-- 拖曳控制點（裝飾性） -->
        <div class="mr-2 flex items-center text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 8h16M4 16h16"
            />
          </svg>
        </div>
        <h3 class="font-medium">{{ task.title }}</h3>
      </div>
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

    <!-- 狀態選取按鈕 -->
    <div class="mt-2 flex justify-end">
      <div class="relative">
        <button
          @click="toggleStatusMenu"
          class="status-badge flex items-center px-3 py-1.5 transition-all duration-200 hover:shadow-sm"
          :class="statusClass"
        >
          {{ statusText }}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="ml-1.5 h-4 w-4 transition-transform duration-200"
            :class="{ 'rotate-180': showStatusMenu }"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 15l7-7 7 7"
            />
          </svg>
        </button>

        <!-- 狀態選擇選單，從下往上展開 -->
        <div
          v-if="showStatusMenu"
          class="absolute bottom-full right-0 z-50 mb-1 w-40 rounded-md bg-white shadow-lg"
        >
          <div class="py-2">
            <button
              @click="updateStatus('todo')"
              class="block w-full border-l-4 border-transparent px-4 py-3 text-left text-sm text-gray-700 transition-colors duration-150 hover:bg-gray-50"
              :class="{ 'border-gray-400 bg-gray-50 font-medium': task.status === 'todo' }"
            >
              <div class="flex items-center">
                <div class="mr-3 h-3 w-3 rounded-full bg-gray-400"></div>
                <span class="text-gray-800">待辦</span>
              </div>
            </button>
            <button
              @click="updateStatus('in_progress')"
              class="block w-full border-l-4 border-transparent px-4 py-3 text-left text-sm text-gray-700 transition-colors duration-150 hover:bg-blue-50"
              :class="{ 'border-blue-400 bg-blue-50 font-medium': task.status === 'in_progress' }"
            >
              <div class="flex items-center">
                <div class="mr-3 h-3 w-3 rounded-full bg-blue-400"></div>
                <span class="text-blue-800">進行中</span>
              </div>
            </button>
            <button
              @click="updateStatus('completed')"
              class="block w-full border-l-4 border-transparent px-4 py-3 text-left text-sm text-gray-700 transition-colors duration-150 hover:bg-green-50"
              :class="{ 'border-green-400 bg-green-50 font-medium': task.status === 'completed' }"
            >
              <div class="flex items-center">
                <div class="mr-3 h-3 w-3 rounded-full bg-green-400"></div>
                <span class="text-green-800">已完成</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

import type { TaskResponse } from '@/types/response';

const props = defineProps<{
  task: TaskResponse;
}>();

const emit = defineEmits<{
  (e: 'update:status', taskId: string, status: string): void;
  (e: 'task-drop', dropData: any): void;
}>();

// 狀態選單顯示控制
const showStatusMenu = ref(false);

// 切換狀態選單顯示/隱藏
const toggleStatusMenu = (event: MouseEvent) => {
  event.stopPropagation(); // 阻止事件冒泡
  showStatusMenu.value = !showStatusMenu.value;
};

// 點擊其他地方關閉選單
const handleDocumentClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (!target.closest('.status-badge') && showStatusMenu.value) {
    showStatusMenu.value = false;
  }
};

// 添加點擊事件
document.addEventListener('click', handleDocumentClick);

// 組件卸載時移除事件
document.addEventListener('beforeunload', () => {
  document.removeEventListener('click', handleDocumentClick);
});

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

// 更新任務狀態
const updateStatus = (status: string) => {
  emit('update:status', props.task.id, status);
  showStatusMenu.value = false; // 選擇後關閉選單
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
