<template>
  <el-select v-model="model" :class="[className]" v-bind="$attrs">
    <el-option
      v-for="option in options"
      :key="String(option.value)"
      :label="t(`option.${namespace}.${option.value}`)"
      :value="option.value"
    />
  </el-select>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ElOption, ElSelect } from 'element-plus';
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

const model = computed({
  get: () => modelValue,
  set: (val: string) => emit('update:modelValue', val),
});
</script>
