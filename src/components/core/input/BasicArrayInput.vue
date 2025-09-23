<template>
  <div class="space-y-2">
    <Label :label="title" />
    <div v-for="(item, index) in modelValue" :key="index" class="flex flex-col space-y-2">
      <div class="flex items-center gap-2">
        <input
          v-model="item.name"
          type="text"
          class="flex-1 rounded-md border border-gray-300 p-1 text-sm"
          :placeholder="namePlaceholder"
        />
        <button class="text-red-500 hover:text-red-700" @click="removeItem(index)">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      <!-- Slot for additional inputs -->
      <slot name="inputs" :item="item" :index="index" />

      <div v-if="itemErrors && itemErrors[index]" class="text-xs text-red-500">
        {{ itemErrors[index] }}
      </div>
    </div>
    <button
      class="flex w-full items-center justify-center rounded-md border border-dashed border-gray-300 py-1 text-sm text-gray-500 hover:bg-gray-100"
      @click="addItem"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="mr-1 h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
      </svg>
      {{ addButtonText }}
    </button>
  </div>
</template>

<script setup lang="ts" generic="T extends Item">
import { watch } from 'vue';

import Label from '@/components/core/title/Label.vue';

export interface Item {
  name: string;
  [key: string]: any; // Allow other properties
}

const props = withDefaults(
  defineProps<{
    modelValue: T[];
    title: string;
    newItemFactory: () => T;
    namePlaceholder?: string;
    addButtonText?: string;
    itemErrors?: Record<number, string>;
  }>(),
  {
    title: '材料',
    namePlaceholder: '名稱',
    addButtonText: '添加',
    itemErrors: () => ({}),
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: T[]): void;
}>();

// Watch for deep changes in modelValue and emit them
// This ensures parent components are updated when nested properties of items change
watch(
  () => props.modelValue,
  (newValue) => {
    emit('update:modelValue', newValue);
  },
  { deep: true }
);

const addItem = () => {
  const newItems = [...props.modelValue, props.newItemFactory()];
  emit('update:modelValue', newItems);
};

const removeItem = (index: number) => {
  const newItems = [...props.modelValue];
  newItems.splice(index, 1);
  emit('update:modelValue', newItems);
};
</script>
