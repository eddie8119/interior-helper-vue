<template>
  <div
    class="cursor-pointer rounded-lg border p-3 transition-all hover:shadow-md"
    :class="{
      'animate-side-highlight border-blue-200 bg-blue-50 shadow-lg ring-2 ring-blue-300 ring-offset-2':
        isHighlighted,
      'border-blue-200 bg-blue-50': isSelected && !isHighlighted,
      'border-green-200 bg-green-50': isLinked && !isSelected && !isHighlighted,
      'border-gray-200 bg-white hover:border-gray-300': !isLinked && !isSelected && !isHighlighted,
    }"
    @click="$emit('select')"
  >
    <!-- 任務標題 -->
    <div class="mb-2 grid grid-cols-[1fr_auto] items-start gap-2">
      <h4 class="line-clamp-2 text-sm font-medium text-gray-900">
        {{ task.title }}
      </h4>

      <!-- 狀態指示器與建立時間 -->
      <div class="flex flex-col items-end text-right">
        <div class="text-xs text-gray-500">創建: {{ task.createdAt }}</div>
      </div>
    </div>

    <!-- 任務描述 -->
    <p v-if="task.description" class="mb-3 line-clamp-2 text-xs text-gray-600">
      {{ task.description }}
    </p>

    <!-- 操作按鈕 -->
    <div class="flex items-center justify-end">
      <div class="flex space-x-2">
        <button
          v-if="!isLinked"
          class="rounded px-2 py-1 text-xs hover:opacity-90"
          :class="pinButtonClass"
          @click.stop="handlePinButtonClick"
        >
          <span v-if="task.pinLocation" class="flex items-center">
            <img src="@/assets/icons/PinGreen.png" alt="Pin" class="mr-1 h-4 w-4" /> 已標記
          </span>
          <span v-else>{{ pinButtonLabel }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { TaskResponse } from '@/types/response';

import { formatDate } from '@/utils/date';

const props = withDefaults(
  defineProps<{
    task: TaskResponse;
    isLinked: boolean;
    isSelected: boolean;
    isHighlighted: boolean;
    isPinning?: boolean;
    pinningTaskId?: string | null;
  }>(),
  {
    isPinning: false,
    pinningTaskId: null,
  }
);

const emit = defineEmits<{
  (e: 'select'): void;
  (e: 'link-to-marker'): void;
  (e: 'create-marker'): void;
  (e: 'remove-pin'): void;
  (e: 'cancel-marker'): void;
}>();

const task = computed(() => props.task);
const isLinked = computed(() => props.isLinked);
const isSelected = computed(() => props.isSelected);
const isHighlighted = computed(() => props.isHighlighted);
const isPinning = computed(() => props.isPinning);
const pinningTaskId = computed(() => props.pinningTaskId);

const isCurrentPinning = computed(
  () => !task.value.pinLocation && isPinning.value && pinningTaskId.value === task.value.id
);

const pinButtonClass = computed(() => {
  if (task.value.pinLocation) {
    return 'bg-green-100 text-green-700 hover:bg-green-200';
  }
  if (isCurrentPinning.value) {
    return 'bg-red-100 text-red-700 hover:bg-red-200';
  }
  return 'bg-blue-100 text-blue-700 hover:bg-blue-200';
});

const pinButtonLabel = computed(() => (isCurrentPinning.value ? '取消標記' : '📍 標記'));

const handlePinButtonClick = () => {
  if (task.value.pinLocation) {
    emit('remove-pin');
    return;
  }
  if (isCurrentPinning.value) {
    emit('cancel-marker');
    return;
  }
  emit('create-marker');
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
