<template>
  <div class="flex h-full flex-col">
    <!-- Display Mode Tabs -->
    <nav class="flex items-center justify-end">
      <ul class="flex gap-2">
        <li v-for="mode in taskScheduleDisplayModeList" :key="mode.value">
          <button
            class="tab-button rounded-lg px-4 py-2 text-sm font-medium transition-colors"
            :class="{ 'is-active': displayMode === mode.value }"
            @click="displayMode = mode.value"
          >
            {{ t(`tab.schedule.${mode.value}`) }}
          </button>
        </li>
      </ul>
    </nav>

    <!-- Tasks Container -->
    <div ref="scrollContainer" class="flex-1 overflow-y-auto scroll-smooth">
      <div v-if="groupedTasks.length === 0" class="flex h-full items-center justify-center">
        <p class="text-gray-400">{{ t('message.no_tasks') }}</p>
      </div>

      <div v-else class="space-y-8 p-1 md:p-4">
        <template v-for="(group, index) in groupedTasks" :key="group.dateKey">
          <DayGroup
            :group="group"
            :show-break-line="
              index > 0 && !isConsecutiveDate(groupedTasks[index - 1].date, group.date)
            "
            :expanded-task-ids="expandedTaskIds"
            @update:expanded="updateTaskExpanded"
            @update:task="handleUpdateTask"
            @delete="handleDeleteTask"
            @set-ref="setDayRef"
          />
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import DayGroup from './DayGroup.vue';

import type { TaskResponse } from '@/types/response';

import { TaskScheduleDisplayMode } from '@/types/task';
import { formatDate as formatDateKey, isConsecutiveDate } from '@/utils/date';
import { groupTasksByDate } from '@/utils/scheduleGroupUtils';

const props = defineProps<{
  tasks: TaskResponse[];
  selectedDate: Date;
}>();

const emit = defineEmits<{
  (e: 'update:task', taskId: string, patch: Partial<TaskResponse>): void;
  (e: 'delete', taskId: string): void;
}>();

const { t } = useI18n();

const scrollContainer = ref<HTMLElement | null>(null);
const dayRefs = ref<Map<string, HTMLElement>>(new Map());
const expandedTaskIds = ref<Set<string>>(new Set());
const displayMode = ref<TaskScheduleDisplayMode>(TaskScheduleDisplayMode.ReminderDateTime);

const taskScheduleDisplayModeList = [
  { value: TaskScheduleDisplayMode.ReminderDateTime, label: t('schedule.display_mode.reminder') },
  { value: TaskScheduleDisplayMode.EndDateTime, label: t('schedule.display_mode.end') },
  { value: TaskScheduleDisplayMode.All, label: t('schedule.display_mode.all') },
];

const groupedTasks = computed(() => groupTasksByDate(props.tasks, t, displayMode.value));

const setDayRef = (dateKey: string, el: HTMLElement) => {
  if (el) {
    dayRefs.value.set(dateKey, el);
  }
};

const updateTaskExpanded = (taskId: string, value: boolean) => {
  if (value) {
    expandedTaskIds.value.add(taskId);
  } else {
    expandedTaskIds.value.delete(taskId);
  }
};

const handleUpdateTask = (taskId: string, patch: Partial<TaskResponse>) => {
  emit('update:task', taskId, patch);
};

const handleDeleteTask = (taskId: string) => {
  emit('delete', taskId);
};

// Scroll to selected date
watch(
  () => props.selectedDate,
  async (newDate) => {
    await nextTick();
    const dateKey = formatDateKey(newDate);
    const element = dayRefs.value.get(dateKey);

    if (element && scrollContainer.value) {
      const containerTop = scrollContainer.value.getBoundingClientRect().top;
      const elementTop = element.getBoundingClientRect().top;
      const scrollOffset = elementTop - containerTop;

      scrollContainer.value.scrollBy({
        top: scrollOffset - 20,
        behavior: 'smooth',
      });
    }
  },
  { immediate: false }
);
</script>

<style scoped>
.tab-button {
  @apply bg-primary-panel text-black-400 dark:bg-primaryDark-panel;

  cursor: pointer;
}

.tab-button.is-active {
  @apply bg-brand-tertiary text-black-900;
}
</style>
