<template>
  <!-- Break Line for Non-Consecutive Dates -->
  <div v-if="showBreakLine" class="break-line-vertical" />

  <div :ref="setDayRef" class="day-section">
    <div class="flex flex-row items-start gap-4 lg:flex-col">
      <!-- Date Header -->
      <div class="date-header flex-shrink-0 lg:sticky lg:top-0 lg:z-10 lg:mb-4 lg:pb-2">
        <div class="flex items-baseline gap-4">
          <h2 class="text-color-difference text-6xl font-bold">
            {{ group.day }}
          </h2>
          <div class="flex flex-col">
            <span class="font-medium text-secondary-red">{{ group.weekDay }}</span>
            <span class="text200-color-difference text-sm">{{ group.monthYear }}</span>
          </div>
        </div>
      </div>

      <div class="task-container flex flex-1 flex-wrap gap-2 sm:gap-3">
        <div
          v-for="task in group.tasks"
          :key="task.id"
          data-task-card
          class="transition-opacity duration-75"
        >
          <TaskCardItem
            :task="task"
            :expanded="expandedTaskIds.has(task.id)"
            @update:expanded="(value) => updateTaskExpanded(task.id, value)"
            @update:task="handleUpdateTask"
            @delete="handleDeleteTask"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

import TaskCardItem from './TaskCardItem.vue';

import type { TaskResponse } from '@/types/response';
import type { DayGroup as DayGroupType } from '@/utils/scheduleGroupUtils';

const props = defineProps<{
  group: DayGroupType;
  showBreakLine: boolean;
  expandedTaskIds: Set<string>;
}>();

const emit = defineEmits<{
  (e: 'update:expanded', taskId: string, value: boolean): void;
  (e: 'update:task', taskId: string, patch: Partial<TaskResponse>): void;
  (e: 'delete', taskId: string): void;
  (e: 'set-ref', dateKey: string, el: HTMLElement): void;
}>();

const dayRef = ref<HTMLElement | null>(null);
const headerRef = ref<HTMLElement | null>(null);
const taskContainerRef = ref<HTMLElement | null>(null);

const setDayRef = (el: HTMLElement | null) => {
  if (el) {
    dayRef.value = el as HTMLElement;
    emit('set-ref', props.group.dateKey, el);
  }
};

const updateTaskExpanded = (taskId: string, value: boolean) => {
  emit('update:expanded', taskId, value);
};

const handleUpdateTask = (taskId: string, patch: Partial<TaskResponse>) => {
  emit('update:task', taskId, patch);
};

const handleDeleteTask = (taskId: string) => {
  emit('delete', taskId);
};

// 計算任務卡片與 header 的距離，動態調整透明度
const updateTaskOpacity = () => {
  if (!headerRef.value || !taskContainerRef.value) return;

  const headerRect = headerRef.value.getBoundingClientRect();
  const headerBottom = headerRect.bottom;
  const fadeDistance = 120; // 漸層距離（像素）

  const taskCards = taskContainerRef.value.querySelectorAll('[data-task-card]');
  taskCards.forEach((card) => {
    const cardRect = card.getBoundingClientRect();
    const cardTop = cardRect.top;
    const distance = cardTop - headerBottom;

    // 計算透明度：距離越近越透明
    // 只有當卡片進入 header 下方的漸層區域時才改變透明度
    let opacity = 1;
    if (distance < 0) {
      // 卡片已經進入 header 區域，開始漸層
      opacity = Math.max(0, (distance + fadeDistance) / fadeDistance);
    }

    (card as HTMLElement).style.opacity = opacity.toString();
  });
};

onMounted(() => {
  // 初始化 refs
  if (dayRef.value) {
    headerRef.value = dayRef.value.querySelector('.date-header') as HTMLElement;
    taskContainerRef.value = dayRef.value.querySelector('.task-container') as HTMLElement;
  }

  // 尋找滾動容器（向上查找 overflow-y-auto 的父元素）
  let scrollContainer: Element | Window = window;
  if (dayRef.value) {
    let current: Element | null = dayRef.value;
    while (current) {
      const style = window.getComputedStyle(current);
      if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
        scrollContainer = current;
        break;
      }
      current = current.parentElement;
    }
  }

  // 監聽滾動事件
  scrollContainer.addEventListener('scroll', updateTaskOpacity, { passive: true });

  // 初始計算一次
  updateTaskOpacity();
});

onUnmounted(() => {
  // 尋找滾動容器
  let scrollContainer: Element | Window = window;
  if (dayRef.value) {
    let current: Element | null = dayRef.value;
    while (current) {
      const style = window.getComputedStyle(current);
      if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
        scrollContainer = current;
        break;
      }
      current = current.parentElement;
    }
  }

  scrollContainer.removeEventListener('scroll', updateTaskOpacity);
});
</script>

<style scoped>
.day-section {
  scroll-margin-top: 20px;
}
</style>
