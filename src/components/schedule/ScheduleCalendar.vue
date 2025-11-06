<template>
  <div class="schedule-calendar flex h-full flex-col p-4">
    <!-- Header -->
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-base font-semibold text-gray-800">{{ currentMonth }} {{ currentYear }}</h3>
      <div class="flex gap-2">
        <button
          type="button"
          class="rounded p-1 text-gray-500 transition-colors hover:bg-gray-200"
          @click="previousMonth"
          title="Previous month"
        >
          <ElIcon class="text-base"><ArrowLeft /></ElIcon>
        </button>
        <button
          type="button"
          class="rounded p-1 text-gray-500 transition-colors hover:bg-gray-200"
          @click="nextMonth"
          title="Next month"
        >
          <ElIcon class="text-base"><ArrowRight /></ElIcon>
        </button>
      </div>
    </div>

    <!-- Calendar Grid -->
    <div class="calendar-grid">
      <!-- Weekday headers -->
      <div v-for="day in weekDays" :key="`header-${day}`" class="calendar-header">
        {{ day }}
      </div>

      <!-- Calendar dates -->
      <button
        v-for="date in calendarDates"
        :key="date.key"
        type="button"
        :class="[
          'calendar-date',
          !date.isCurrentMonth && 'is-other-month',
          date.isToday && 'is-today',
          date.isSelected && 'is-selected',
          date.hasTask && 'has-task',
        ]"
        @click="selectDate(date)"
      >
        <span>{{ date.day }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft, ArrowRight } from '@element-plus/icons-vue';
import { ElIcon } from 'element-plus';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

interface CalendarDate {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasTask: boolean;
  key: string;
}

const props = defineProps<{
  selectedDate: Date;
  taskDates: Date[]; // Dates that have tasks
}>();

const emit = defineEmits<{
  (e: 'update:selectedDate', date: Date): void;
}>();

const { t } = useI18n();

const currentDate = ref(new Date(props.selectedDate));

const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => {
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
  return monthNames[currentDate.value.getMonth()];
});

const weekDays = computed(() => [
  t('date.sunday_short'),
  t('date.monday_short'),
  t('date.tuesday_short'),
  t('date.wednesday_short'),
  t('date.thursday_short'),
  t('date.friday_short'),
  t('date.saturday_short'),
]);

const calendarDates = computed((): CalendarDate[] => {
  const year = currentDate.value.getFullYear();
  const month = currentDate.value.getMonth();

  // First day of the month
  const firstDay = new Date(year, month, 1);
  const firstDayOfWeek = firstDay.getDay();

  // Last day of the month
  const lastDay = new Date(year, month + 1, 0);
  const lastDate = lastDay.getDate();

  // Previous month's last date
  const prevMonthLastDate = new Date(year, month, 0).getDate();

  const dates: CalendarDate[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Previous month dates
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDate - i;
    const date = new Date(year, month - 1, day);
    dates.push({
      date,
      day,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      isSelected: isSameDay(date, props.selectedDate),
      hasTask: hasTaskOnDate(date),
      key: `prev-${day}`,
    });
  }

  // Current month dates
  for (let day = 1; day <= lastDate; day++) {
    const date = new Date(year, month, day);
    dates.push({
      date,
      day,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
      isSelected: isSameDay(date, props.selectedDate),
      hasTask: hasTaskOnDate(date),
      key: `current-${day}`,
    });
  }

  // Next month dates
  const remainingDays = 42 - dates.length; // 6 rows * 7 days
  for (let day = 1; day <= remainingDays; day++) {
    const date = new Date(year, month + 1, day);
    dates.push({
      date,
      day,
      isCurrentMonth: false,
      isToday: isSameDay(date, today),
      isSelected: isSameDay(date, props.selectedDate),
      hasTask: hasTaskOnDate(date),
      key: `next-${day}`,
    });
  }

  return dates;
});

const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
};

const hasTaskOnDate = (date: Date): boolean => {
  return props.taskDates.some((taskDate) => isSameDay(taskDate, date));
};

const selectDate = (dateObj: CalendarDate) => {
  emit('update:selectedDate', dateObj.date);
};

const previousMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() - 1,
    1
  );
};

const nextMonth = () => {
  currentDate.value = new Date(
    currentDate.value.getFullYear(),
    currentDate.value.getMonth() + 1,
    1
  );
};
</script>

<style scoped>
.schedule-calendar {
  background-color: #d4d0c8;
  border-radius: 12px;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}

.calendar-header {
  padding: 8px 0;
  font-size: 13px;
  font-weight: 600;
  color: #666;
  text-align: center;
}

.calendar-date {
  position: relative;
  aspect-ratio: 1;
  border: none;
  background-color: transparent;
  color: #333;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.calendar-date.is-other-month {
  color: #bbb;
  cursor: default;
}

.calendar-date.is-other-month:hover {
  background-color: transparent;
}

.calendar-date:hover:not(.is-selected):not(.is-other-month) {
  background-color: rgba(0, 0, 0, 0.08);
}

.calendar-date.is-selected {
  background-color: #ef4444;
  color: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.35);
  font-weight: 700;
}

.calendar-date.is-selected:hover {
  background-color: #dc2626;
}

.calendar-date.has-task::after {
  content: '';
  position: absolute;
  bottom: 6px;
  left: 50%;
  transform: translateX(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #3b82f6;
}

.calendar-date.is-selected.has-task::after {
  background-color: white;
}
</style>
