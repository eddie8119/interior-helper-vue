<template>
  <div
    class="grid grid-cols-1 items-center gap-4 rounded-xl border border-gray-200/70 p-3 sm:flex sm:flex-row sm:items-center md:grid-cols-2"
  >
    <!-- Status and Display -->
    <div class="filter-container-outter gap-4">
      <div class="filter-container-inner">
        <Label :label="t('label.task.status')" />
        <OptionSelector
          :model-value="selectedStatus"
          :options="statusOptions"
          :class-name="'w-full sm:w-[140px]'"
          @update:model-value="handleStatusChange"
        />
      </div>
      <div class="filter-container-inner">
        <Label :label="t('label.task.task_display')" />
        <OptionSelector
          :model-value="taskCardDisplayMode"
          :options="TASK_DISPLAY_OPTIONS"
          :class-name="'w-full sm:w-[140px]'"
          :namespace="'display'"
          @update:model-value="handleDisplayModeChange"
        />
      </div>
    </div>
    <!-- Days Range -->
    <div class="filter-container-outter">
      <div class="filter-container-inner w-full self-center sm:w-[280px]">
        <div class="flex items-center justify-between">
          <Label :label="t('label.task.due_date_range')" />
          <ElSwitch
            v-model="isTimeFilterEnabled"
            :active-text="t('label.actions.enable')"
            :inactive-text="t('label.actions.disable')"
            inline-prompt
            @change="toggleTimeFilter"
          />
        </div>
        <div class="flex h-10 w-full items-center">
          <ElSlider
            v-model="daysRange"
            class="slider-bar w-full"
            range
            :min="0"
            :max="10"
            :marks="daysMarks"
            :show-tooltip="true"
            :disabled="!isTimeFilterEnabled"
            @change="handleDaysRangeChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElSlider, ElSwitch } from 'element-plus';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { TaskFilterStatus } from '@/constants/selection';
import type { TaskCardDisplayMode } from '@/constants/selection';

import Label from '@/components/core/title/Label.vue';
import OptionSelector from '@/components/ui/OptionSelector.vue';
import {
  STATUS_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS_WITHOUT_DONE,
  TASK_DISPLAY_OPTIONS,
} from '@/constants/selection';
import { useTaskCardFilter } from '@/context/useTaskCardFilter';

const props = withDefaults(
  defineProps<{
    statusDisplayMode?: 'normal' | 'withoutDone';
  }>(),
  {
    statusDisplayMode: 'normal',
  }
);

const emit = defineEmits<{
  (e: 'update:selectedStatus', value: TaskFilterStatus): void;
  (e: 'update:daysRange', value: [number, number] | null): void;
}>();

const { t } = useI18n();

const statusOptions = computed(() => {
  switch (props.statusDisplayMode) {
    case 'normal':
      return STATUS_FILTER_OPTIONS;
    case 'withoutDone':
      return STATUS_FILTER_OPTIONS_WITHOUT_DONE;
    default:
      return STATUS_FILTER_OPTIONS;
  }
});

// Status filter
const selectedStatus = ref<TaskFilterStatus>('all');

// Days range filter
const isTimeFilterEnabled = ref(false);
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
const { displayMode: taskCardDisplayMode, updateVisibility } = useTaskCardFilter();

const handleStatusChange = (status: TaskFilterStatus) => {
  selectedStatus.value = status;
  emit('update:selectedStatus', status);
};

const handleDisplayModeChange = (mode: TaskCardDisplayMode) => {
  updateVisibility(mode);
};

const handleDaysRangeChange = (value: number | number[]) => {
  if (Array.isArray(value) && value.length === 2 && isTimeFilterEnabled.value) {
    emit('update:daysRange', [value[0], value[1]]);
  }
};

const toggleTimeFilter = (enabled: boolean | string | number) => {
  if (enabled) {
    emit('update:daysRange', daysRange.value);
  } else {
    emit('update:daysRange', null);
  }
};
</script>

<style scoped>
.filter-container-outter {
  @apply flex rounded-lg bg-gray-100 p-4 dark:bg-primaryDark-panel;
}

.filter-container-inner {
  @apply flex flex-col justify-center gap-1;
}
</style>
