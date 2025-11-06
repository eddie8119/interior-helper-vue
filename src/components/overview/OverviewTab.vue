<template>
  <div class="flex gap-2">
    <TextButton
      v-for="tab in OVERVIEW_TASK_CONDITION_TAB_LIST"
      :key="tab.name"
      class="tab-button"
      :class="{ 'is-active': taskTimeCondition === tab.name }"
      @click="handleClick(tab.name)"
    >
      {{ t(`label.time_status.${tab.name}`) }}{{ t('label.task.task') }}
    </TextButton>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import TextButton from '@/components/core/button/TextButton.vue';
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
  @apply bg-primary-panel p-2 dark:bg-primaryDark-panel;
  cursor: pointer;
}

.tab-button.is-active {
  @apply bg-brand-tertiary;
}
</style>
