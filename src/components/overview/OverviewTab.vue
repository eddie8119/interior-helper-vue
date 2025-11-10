<template>
  <div class="flex flex-col">
    <Label :label="t('label.time') + t('label.filter') + ':'" />
    <!-- Mobile: horizontal scroll + snap; Desktop: inline-flex pill -->
    <div class="rounded-full sm:inline-flex sm:overflow-hidden">
      <div class="flex snap-x snap-mandatory overflow-x-auto sm:snap-none sm:overflow-visible">
        <button
          v-for="tab in OVERVIEW_TASK_CONDITION_TAB_LIST"
          :key="tab.name"
          class="tab-button shrink-0 snap-start rounded-none px-3 py-1 py-2 sm:first:rounded-l-full sm:first:pl-5 sm:last:rounded-r-full sm:last:pr-5"
          :class="{ 'is-active': taskTimeCondition === tab.name }"
          :aria-selected="taskTimeCondition === tab.name"
          @click="handleClick(tab.name)"
        >
          {{ t(`label.time_status.${tab.name}`) }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import Label from '@/components/core/title/Label.vue';
import { OVERVIEW_TASK_CONDITION_TAB_LIST } from '@/constants/tab';
import { TaskTimeCondition } from '@/types/task';

const { taskTimeCondition } = defineProps<{
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
  @apply bg-primary-panel text-black-400 dark:bg-primaryDark-panel;

  cursor: pointer;
}

.tab-button.is-active {
  @apply bg-brand-tertiary text-black-900;
}

/* Add separators between items on md and above */
@media (min-width: 768px) {
  .tab-button + .tab-button {
    border-left: 1px solid rgb(0 0 0 / 8%);
  }

  .dark .tab-button + .tab-button {
    border-left-color: rgb(255 255 255 / 15%);
  }
}
</style>
