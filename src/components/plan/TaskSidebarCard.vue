<template>
  <div
    class="cursor-pointer rounded-lg border p-3 transition-all hover:shadow-md"
    :class="{
      'border-blue-200 bg-blue-50': isSelected,
      'border-green-200 bg-green-50': isLinked && !isSelected,
      'border-gray-200 bg-white hover:border-gray-300': !isLinked && !isSelected,
    }"
    @click="$emit('select')"
  >
    <!-- 任務標題 -->
    <div class="mb-2 flex items-start justify-between">
      <h4 class="line-clamp-2 text-sm font-medium text-gray-900">
        {{ task.title }}
      </h4>

      <!-- 狀態指示器 -->
      <div class="ml-2 flex items-center space-x-1">
        <!-- 連結狀態 -->
        <div
          v-if="isLinked"
          class="flex h-5 w-5 items-center justify-center rounded-full bg-green-100"
          title="已連結到平面圖"
        >
          <svg class="h-3 w-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fill-rule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clip-rule="evenodd"
            />
          </svg>
        </div>

        <!-- 任務狀態 -->
        <div
          class="h-2 w-2 rounded-full"
          :class="{
            'bg-gray-400': task.status === 'pending',
            'bg-blue-400': task.status === 'in_progress',
            'bg-green-400': task.status === 'completed',
          }"
          :title="getStatusText(task.status)"
        />
      </div>
    </div>

    <!-- 任務描述 -->
    <p v-if="task.description" class="mb-3 line-clamp-2 text-xs text-gray-600">
      {{ task.description }}
    </p>

    <!-- 操作按鈕 -->
    <div class="flex items-center justify-between">
      <div class="text-xs text-gray-500">
        {{ formatDate(task.createdAt) }}
      </div>

      <div class="flex space-x-2">
        <button
          v-if="!isLinked"
          class="rounded px-2 py-1 text-xs hover:opacity-90"
          :class="task.pinLocation
            ? 'bg-green-100 text-green-700 hover:bg-green-200'
            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'"
          @click.stop="$emit('create-marker')"
        >
          {{ task.pinLocation ? '📍 已釘選' : '📍 標記' }}
        </button>
        <button
          v-else
          class="rounded bg-green-100 px-2 py-1 text-xs text-green-700 hover:bg-green-200"
          @click.stop="$emit('link-to-marker')"
        >
          查看
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TaskResponse } from '@/types/response';

interface Props {
  task: TaskResponse;
  isLinked: boolean;
  isSelected: boolean;
}

defineProps<Props>();

defineEmits<{
  (e: 'select'): void;
  (e: 'link-to-marker'): void;
  (e: 'create-marker'): void;
}>();

const getStatusText = (status: string) => {
  const statusMap = {
    pending: '待處理',
    in_progress: '進行中',
    completed: '已完成',
  };
  return statusMap[status as keyof typeof statusMap] || status;
};

const formatDate = (date: string | Date) => {
  const d = new Date(date);
  return d.toLocaleDateString('zh-TW', {
    month: 'short',
    day: 'numeric',
  });
};
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
