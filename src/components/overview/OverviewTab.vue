<template>
  <div class="tabs">
    <button
      v-for="tab in OVERVIEW_TASK_CONDITION_TAB_LIST"
      :key="tab.name"
      class="tab-button"
      :class="{ 'is-active': taskTimeCondition === tab.name }"
      @click="handleClick(tab.name)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { OVERVIEW_TASK_CONDITION_TAB_LIST } from '@/constants/tab';
import { TaskTimeCondition } from '@/types/task';

defineProps<{
  taskTimeCondition: TaskTimeCondition;
}>();

const emits = defineEmits<{ (e: 'update:taskTimeCondition', value: TaskTimeCondition): void }>();

const handleClick = (value: string) => {
  emits('update:taskTimeCondition', value as TaskTimeCondition);
};
</script>

<style scoped>
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.tab-button {
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: #f0f0f0;
  cursor: pointer;
}

.tab-button.is-active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}
</style>
