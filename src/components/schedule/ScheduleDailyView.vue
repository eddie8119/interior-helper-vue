<template>
  <div ref="scrollContainer" class="schedule-daily-view h-full overflow-y-auto">
    <div v-if="groupedTasks.length === 0" class="flex h-full items-center justify-center">
      <p class="text-gray-400">{{ t('message.no_tasks') }}</p>
    </div>

    <div v-else class="space-y-8 p-4">
      <template v-for="(group, index) in groupedTasks" :key="group.dateKey">
        <!-- Break Line for Non-Consecutive Dates -->
        <div
          v-if="index > 0 && !isConsecutiveDate(groupedTasks[index - 1].date, group.date)"
          class="break-line-vertical"
        ></div>

        <div :ref="(el) => setDayRef(group.dateKey, el)" class="day-section">
          <!-- Date Header -->
          <div class="sticky top-0 z-10 mb-4 bg-white pb-2">
            <div class="flex items-baseline gap-4">
              <h2 class="text-6xl font-bold text-gray-900">
                {{ group.day }}
              </h2>
              <div class="flex flex-col">
                <span class="text-sm font-medium text-red-500">{{ group.weekDay }}</span>
                <span class="text-xs text-gray-500">{{ group.monthYear }}</span>
              </div>
            </div>
          </div>

          <!-- Task List -->
          <div v-if="group.tasks.length === 0" class="py-8 text-center">
            <ElIcon class="text-4xl text-gray-300"><Calendar /></ElIcon>
            <p class="mt-2 text-sm text-gray-400">{{ t('message.no_tasks_for_day') }}</p>
          </div>

          <!-- Horizontal Task Cards -->
          <div v-else class="flex flex-wrap gap-3">
            <div
              v-for="task in group.tasks"
              :key="task.id"
              class="task-card-compact"
              :class="expandedTaskIds.has(task.id) && 'is-expanded'"
            >
              <!-- Collapsed View -->
              <div
                v-if="!expandedTaskIds.has(task.id)"
                class="task-card-collapsed cursor-pointer rounded-lg border-2 p-4 transition-all hover:shadow-md"
                @click="toggleTaskExpand(task.id)"
              >
                <div class="mb-2 text-xs font-medium text-gray-500">
                  {{ formatTime(task.reminderDatetime || task.endDate) }}
                </div>
                <div class="mb-3 line-clamp-2 text-sm font-semibold text-gray-900">
                  {{ task.title }}
                </div>
                <div class="flex items-center justify-between">
                  <div class="flex gap-1">
                    <span
                      v-if="task.materials && task.materials.length > 0"
                      class="text-xs text-gray-500"
                      >📦</span
                    >
                    <span v-if="task.description" class="text-xs text-gray-500">📝</span>
                  </div>
                  <button
                    type="button"
                    class="rounded p-1 hover:bg-gray-100"
                    @click.stop="toggleTaskExpand(task.id)"
                  >
                    <ElIcon class="text-gray-600"><ArrowRight /></ElIcon>
                  </button>
                </div>
              </div>

              <!-- Expanded View -->
              <div
                v-else
                class="task-card-expanded rounded-lg border border-gray-200 bg-white p-4 shadow-md"
              >
                <div class="mb-3 flex items-start justify-between">
                  <div>
                    <div class="text-xs font-medium text-gray-500">
                      {{ formatTime(task.reminderDatetime || task.endDate) }}
                    </div>
                    <div class="text-sm font-semibold text-gray-900">{{ task.title }}</div>
                  </div>
                  <button
                    type="button"
                    class="rounded p-1 hover:bg-gray-100"
                    @click="toggleTaskExpand(task.id)"
                  >
                    <ElIcon class="text-gray-600"><ArrowDown /></ElIcon>
                  </button>
                </div>

                <!-- Full Task Card Content -->
                <TaskCardBase
                  :task="task"
                  :read-only="false"
                  @update:task="handleUpdateTask"
                  @delete="handleDeleteTask"
                />
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowDown, ArrowRight, Calendar } from '@element-plus/icons-vue';
import { ElIcon } from 'element-plus';
import { computed, nextTick, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { TaskResponse } from '@/types/response';

import TaskCardBase from '@/components/task/TaskCardBase.vue';

interface DayGroup {
  dateKey: string;
  date: Date;
  day: number;
  weekDay: string;
  monthYear: string;
  tasks: TaskResponse[];
}

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

const setDayRef = (dateKey: string, el: any) => {
  if (el) {
    dayRefs.value.set(dateKey, el as HTMLElement);
  }
};

const toggleTaskExpand = (taskId: string) => {
  if (expandedTaskIds.value.has(taskId)) {
    expandedTaskIds.value.delete(taskId);
  } else {
    expandedTaskIds.value.add(taskId);
  }
};

const isConsecutiveDate = (date1: Date, date2: Date): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  const timeDiff = d2.getTime() - d1.getTime();
  const dayDiff = timeDiff / (1000 * 60 * 60 * 24);
  return dayDiff === 1;
};

// Group tasks by date
const groupedTasks = computed((): DayGroup[] => {
  if (props.tasks.length === 0) return [];

  // Get unique dates from tasks
  const uniqueDates = new Map<string, Date>();
  props.tasks.forEach((task) => {
    const taskDate = task.reminderDatetime || task.endDate;
    if (taskDate) {
      const date = new Date(taskDate);
      const dateKey = formatDateKey(date);
      if (!uniqueDates.has(dateKey)) {
        uniqueDates.set(dateKey, date);
      }
    }
  });

  // Sort dates
  const sortedDates = Array.from(uniqueDates.values()).sort((a, b) => a.getTime() - b.getTime());

  // Group tasks by date
  const groups: DayGroup[] = sortedDates.map((date) => {
    const dateKey = formatDateKey(date);
    const tasksForDay = props.tasks.filter((task) => {
      const taskDate = task.reminderDatetime || task.endDate;
      if (!taskDate) return false;
      return formatDateKey(new Date(taskDate)) === dateKey;
    });

    // Sort tasks by time
    tasksForDay.sort((a, b) => {
      const timeA = a.reminderDatetime || a.endDate;
      const timeB = b.reminderDatetime || b.endDate;
      if (!timeA || !timeB) return 0;
      return new Date(timeA).getTime() - new Date(timeB).getTime();
    });

    return {
      dateKey,
      date,
      day: date.getDate(),
      weekDay: getWeekDay(date),
      monthYear: getMonthYear(date),
      tasks: tasksForDay,
    };
  });

  return groups;
});

const formatDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

const getWeekDay = (date: Date): string => {
  const weekDays = [
    t('date.sunday_short'),
    t('date.monday_short'),
    t('date.tuesday_short'),
    t('date.wednesday_short'),
    t('date.thursday_short'),
    t('date.friday_short'),
    t('date.saturday_short'),
  ];
  return weekDays[date.getDay()];
};

const getMonthYear = (date: Date): string => {
  const monthNames = [
    t('date.january'),
    t('date.february'),
    t('date.march'),
    t('date.april'),
    t('date.may'),
    t('date.june'),
    t('date.july'),
    t('date.august'),
    t('date.september'),
    t('date.october'),
    t('date.november'),
    t('date.december'),
  ];
  return `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
};

const formatTime = (date: Date | undefined): string => {
  if (!date) return '--:--';
  const d = new Date(date);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

const formatTimeRange = (date: Date | undefined): string => {
  if (!date) return '';
  const d = new Date(date);
  const hours = d.getHours();
  if (hours < 12) return 'AM';
  return 'PM';
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
        top: scrollOffset - 20, // 20px offset from top
        behavior: 'smooth',
      });
    }
  },
  { immediate: false }
);
</script>

<style scoped>
.schedule-daily-view {
  scroll-behavior: smooth;
}

.day-section {
  scroll-margin-top: 20px;
}

.task-card-compact {
  @apply flex-shrink-0;
  width: 240px;
}

.task-card-compact.is-expanded {
  width: 100%;
}

.task-card-collapsed {
  @apply bg-white;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.task-card-expanded {
  width: 100%;
  min-width: 300px;
}
</style>
