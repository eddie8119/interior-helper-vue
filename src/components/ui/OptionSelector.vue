<template>
  <select
    :value="modelValue"
    @change="onChange"
    :class="`rounded-md border p-2 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${className}`"
  >
    <option v-for="option in options" :key="String(option.value)" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>

<script setup lang="ts">
import type { SelectorOption } from '@/types/selection';

const { modelValue, options, className } = defineProps<{
  modelValue: string;
  options: SelectorOption[];
  className?: string;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const onChange = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  emit('update:modelValue', target.value);
};
</script>
