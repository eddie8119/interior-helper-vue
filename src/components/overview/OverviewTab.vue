<template>
  <div class="flex flex-col">
    <Label :label="t('label.time') + t('label.filter') + ':'" />
    <div class="inline-flex overflow-hidden rounded-full">
      <button
        v-for="tab in OVERVIEW_TASK_CONDITION_TAB_LIST"
        :key="tab.name"
        class="tab-button first:rounded-l-full first:pl-5 last:rounded-r-full last:pr-5"
        :class="{ 'is-active': taskTimeCondition === tab.name }"
        @click="handleClick(tab.name)"
      >
        {{ t(`label.time_status.${tab.name}`) }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import Label from '@/components/core/title/Label.vue';
import { OVERVIEW_TASK_CONDITION_TAB_LIST } from '@/constants/tab';
import { TaskTimeCondition } from '@/types/task';

defineProps<{
  taskTimeCondition: TaskTimeCondition;
}>();

const emits = defineEmits<{ (e: 'update:taskTimeCondition', value: TaskTimeCondition): void }>();

const { t } = useI18n();

const handleClick = (value: string) => {
  emits('update:taskTimeCondition', value as TaskTimeCondition);
};
</script>

<style scoped>
.tab-button {
  @apply bg-primary-panel px-3 py-2 text-black-400 dark:bg-primaryDark-panel;
  cursor: pointer;
}

.tab-button.is-active {
  @apply bg-brand-tertiary text-black-900;
}

.tab-button:first-child {
  padding-left: 1.25rem; /* 20px */
}
.tab-button:last-child {
  padding-right: 1.25rem; /* 20px */
}

/* Add separators between items */
.tab-button + .tab-button {
  border-left: 1px solid rgba(0, 0, 0, 0.08);
}
.dark .tab-button + .tab-button {
  border-left-color: rgba(255, 255, 255, 0.15);
}
</style>
