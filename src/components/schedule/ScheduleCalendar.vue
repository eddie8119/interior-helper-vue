<template>
  <div class="basic-container card-color-difference flex h-full flex-col p-3">
    <!-- Header -->
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-black text-base">{{ currentMonth }} {{ currentYear }}</h3>
      <div class="flex gap-2">
        <button
          type="button"
          class="rounded p-1 text-gray-500 transition-colors hover:bg-gray-200"
          title="Previous month"
          @click="previousMonth"
        >
          <ElIcon class="text-base"><ArrowLeft /></ElIcon>
        </button>
        <button
          type="button"
          class="rounded p-1 text-gray-500 transition-colors hover:bg-gray-200"
          title="Next month"
          @click="nextMonth"
        >
          <ElIcon class="text-base"><ArrowRight /></ElIcon>
        </button>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="grid grid-cols-7 gap-2.5">
      <!-- Weekday headers -->
      <div
        v-for="day in weekDays"
        :key="`header-${day}`"
        class="py-2 text-center text-xs font-semibold text-gray-600"
      >
        {{ day }}
      </div>

      <!-- Calendar dates -->
      <button
        v-for="date in calendarDates"
        :key="date.key"
        type="button"
        class="relative flex aspect-square items-center justify-center rounded-lg border-none transition-all duration-200"
        :class="getDateButtonClasses(date)"
        @click="selectDate(date)"
      >
        <span>{{ date.day }}</span>
        <span
          v-if="date.hasTask"
          class="absolute bottom-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full"
          :class="date.isSelected ? 'bg-white' : 'bg-blue-500'"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue';
import { ElIcon } from 'element-plus';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { CalendarDate } from '@/utils/calendarUtils';

import {
  generateCalendarDates,
  getMonthName,
  getNextMonth,
  getPreviousMonth,
  getWeekDayNames,
} from '@/utils/calendarUtils';

const props = defineProps<{
  selectedDate: Date;
  taskDates: Date[];
}>();

const emit = defineEmits<{
  (e: 'update:selectedDate', date: Date): void;
}>();

const { t } = useI18n();

const currentDate = ref(new Date(props.selectedDate));

const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => getMonthName(currentDate.value, t));
const weekDays = computed(() => getWeekDayNames(t));
const calendarDates = computed(() =>
  generateCalendarDates(currentDate.value, props.selectedDate, props.taskDates)
);

const getDateButtonClasses = (date: CalendarDate): string[] => {
  const classes: string[] = [];

  if (!date.isCurrentMonth) {
    classes.push('cursor-default text-gray-400');
  } else {
    classes.push('cursor-pointer text-gray-900 hover:bg-gray-100');
  }

  if (date.isSelected) {
    classes.push(
      'bg-secondary-red text-white font-bold shadow-lg shadow-red-500/35 hover:bg-secondary-red'
    );
  }

  return classes;
};

const selectDate = (dateObj: CalendarDate) => {
  emit('update:selectedDate', dateObj.date);
};

const previousMonth = () => {
  currentDate.value = getPreviousMonth(currentDate.value);
};

const nextMonth = () => {
  currentDate.value = getNextMonth(currentDate.value);
};
</script>

<style scoped></style>
