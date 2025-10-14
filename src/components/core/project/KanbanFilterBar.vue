<template>
  <div class="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
    <div class="flex items-center gap-2">
      <p>全案狀態篩選:</p>
      <OptionSelector
        :model-value="selectedStatus"
        :options="STATUS_FILTER_OPTIONS"
        :class-name="'w-[140px]'"
        @update:model-value="handleStatusChange"
      />
    </div>
    <div class="flex items-center gap-2">
      <p>顯示內容:</p>
      <el-radio-group v-model="displayMode" size="small" @change="handleDisplayModeChange">
        <el-radio-button
          v-for="option in TASK_DISPLAY_OPTIONS"
          :key="option.value"
          :label="option.value"
        >
          {{ t(`option.display.${option.value}`) }}
        </el-radio-button>
      </el-radio-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElRadioButton, ElRadioGroup } from 'element-plus';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { TaskFilterStatus } from '@/constants/selection';
import type { TaskCardDisplayMode } from '@/constants/selection';

import OptionSelector from '@/components/ui/OptionSelector.vue';
import { useTaskCardFilter } from '@/context/useTaskCardFilter';
import { STATUS_FILTER_OPTIONS, TASK_DISPLAY_OPTIONS } from '@/constants/selection';

const emit = defineEmits<{
  (e: 'update:selectedStatus', value: TaskFilterStatus): void;
}>();

const { t } = useI18n();

// Status filter
const selectedStatus = ref<TaskFilterStatus>('all');

// Display mode filter - consume from parent context
const { displayMode, updateVisibility } = useTaskCardFilter();

const handleStatusChange = (status: TaskFilterStatus) => {
  selectedStatus.value = status;
  emit('update:selectedStatus', status);
};

const handleDisplayModeChange = (mode: TaskCardDisplayMode) => {
  updateVisibility(mode);
};
</script>

<style scoped></style>
