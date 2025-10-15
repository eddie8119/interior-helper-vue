<template>
  <div class="mb-6 flex flex-col gap-5 sm:flex-row sm:items-center">
    <div class="filter-container">
      <Label :label="t('label.task.status')" />
      <OptionSelector
        :model-value="selectedStatus"
        :options="STATUS_FILTER_OPTIONS"
        :class-name="'w-[145px]'"
        @update:model-value="handleStatusChange"
      />
    </div>
    <div class="filter-container">
      <Label :label="t('label.task.task_display')" />
      <OptionSelector
        :model-value="displayMode"
        :options="TASK_DISPLAY_OPTIONS"
        :class-name="'w-[145px]'"
        :namespace="'display'"
        @update:model-value="handleDisplayModeChange"
      />
    </div>
    <div class="filter-container w-full sm:w-[280px]">
      <Label :label="t('label.task.reminder_days_range')" />
      <el-slider
        v-model="daysRange"
        range
        :min="0"
        :max="10"
        :marks="daysMarks"
        :show-tooltip="true"
        @change="handleDaysRangeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElRadioButton, ElRadioGroup, ElSlider } from 'element-plus';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { TaskFilterStatus } from '@/constants/selection';
import type { TaskCardDisplayMode } from '@/constants/selection';

import OptionSelector from '@/components/ui/OptionSelector.vue';
import Label from '@/components/core/title/Label.vue';
import { useTaskCardFilter } from '@/context/useTaskCardFilter';
import { STATUS_FILTER_OPTIONS, TASK_DISPLAY_OPTIONS } from '@/constants/selection';

const emit = defineEmits<{
  (e: 'update:selectedStatus', value: TaskFilterStatus): void;
  (e: 'update:daysRange', value: [number, number]): void;
}>();

const { t } = useI18n();

// Status filter
const selectedStatus = ref<TaskFilterStatus>('all');

// Days range filter (0, 1, 2, 3, 5, 7, 10, >10)
const daysRange = ref<[number, number]>([0, 10]);
const daysMarks: Record<number, string> = {
  0: '0',
  1: '1',
  2: '2',
  3: '3',
  5: '5',
  7: '7',
  10: '>10',
};

// Display mode filter - consume from parent context
const { displayMode, updateVisibility } = useTaskCardFilter();

const handleStatusChange = (status: TaskFilterStatus) => {
  selectedStatus.value = status;
  emit('update:selectedStatus', status);
};

const handleDisplayModeChange = (mode: TaskCardDisplayMode) => {
  updateVisibility(mode);
};

const handleDaysRangeChange = (value: number | number[]) => {
  if (Array.isArray(value) && value.length === 2) {
    emit('update:daysRange', [value[0], value[1]]);
  }
};
</script>

<style scoped>
.filter-container {
  @apply flex h-10 flex-col;
}
</style>
