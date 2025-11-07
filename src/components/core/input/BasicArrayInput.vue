<template>
  <div class="space-y-2">
    <Label :label="title" />
    <div v-for="(item, index) in modelValue" :key="index" class="flex flex-col space-y-2">
      <div class="flex items-center gap-2">
        <input
          v-model="item.name"
          type="text"
          class="input-border input-common flex-1 p-1"
          :placeholder="t(namePlaceholder)"
        />
        <button class="text-secondary-red hover:text-red-700" @click="removeItem(index)">
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

      <div v-if="itemErrors && itemErrors[index]" class="text-xs text-secondary-red">
        {{ itemErrors[index] }}
      </div>
    </div>
    <button
      class="flex w-full items-center justify-center rounded-md border border-dashed border-gray-300 p-2 text-sm text-gray-500 hover:bg-gray-100"
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
import { useI18n } from 'vue-i18n';

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

const { t } = useI18n();

// Note: Avoid re-emitting on deep prop changes to prevent recursive updates.
// Parent components will receive updates explicitly via addItem/removeItem,
// and by direct v-model binding on nested fields when desired.

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
