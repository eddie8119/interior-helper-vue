<template>
  <select
    :value="modelValue"
    @change="onChange"
    class="w-1/3 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
  >
    <option v-for="option in options" :key="String(option.value)" :value="option.value">
      {{ option.label }}
    </option>
  </select>
</template>

<script setup lang="ts">
import type { SelectorOption } from '@/types/selection';

const { modelValue, options } = defineProps<{
  modelValue: string;
  options: SelectorOption[];
}>();

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const onChange = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  emit('update:modelValue', target.value);
};
</script>
