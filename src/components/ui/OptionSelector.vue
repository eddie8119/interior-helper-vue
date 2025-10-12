<template>
  <select
    :value="modelValue"
    :class="`rounded-md border p-2 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200 ${className}`"
    @change="onChange"
  >
    <option v-for="option in options" :key="String(option.value)" :value="option.value">
      {{ t(`option.${namespace}.${option.value}`) }}
    </option>
  </select>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import type { SelectorOption } from '@/types/selection';

const {
  modelValue,
  options,
  className,
  namespace = 'status',
} = defineProps<{
  modelValue: string;
  options: SelectorOption[];
  className?: string;
  namespace?: string;
}>();

const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>();

const { t } = useI18n();

const onChange = (e: Event) => {
  const target = e.target as HTMLSelectElement;
  emit('update:modelValue', target.value);
};
</script>
