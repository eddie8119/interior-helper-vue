<template>
  <div class="space-y-2">
    <h3 class="font-medium text-gray-700">{{ title }}</h3>
    <div v-for="(item, index) in modelValue" :key="index" class="flex flex-col space-y-2">
      <div class="flex items-center gap-2">
        <input
          v-model="item.name"
          type="text"
          class="flex-1 rounded-md border border-gray-300 p-1 text-sm"
          :placeholder="namePlaceholder"
        />
        <button
          class="text-red-500 hover:text-red-700"
          :title="removeButtonTitle"
          @click="removeItem(index)"
        >
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
      <div class="flex items-center gap-2">
        <div class="flex items-center">
          <span class="mr-1 text-xs text-gray-500">{{ quantityLabel }}:</span>
          <input
            v-model.number="item.quantity"
            type="number"
            min="1"
            class="w-16 rounded-md border border-gray-300 p-1 text-sm"
            :placeholder="quantityPlaceholder"
          />
        </div>
        <div class="flex items-center">
          <span class="mr-1 text-xs text-gray-500">{{ priceLabel }}:</span>
          <input
            v-model.number="item.unitPrice"
            type="number"
            min="0"
            class="w-20 rounded-md border border-gray-300 p-1 text-sm"
            :placeholder="pricePlaceholder"
          />
        </div>
      </div>
      <div v-if="itemErrors[index]" class="text-xs text-red-500">
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

<script setup lang="ts">
import { ref, watch } from 'vue';

export interface Item {
  name: string;
  quantity?: number;
  unitPrice?: number;
}

// Props
const props = defineProps<{
  modelValue: Item[];
  title?: string;
  namePlaceholder?: string;
  quantityLabel?: string;
  quantityPlaceholder?: string;
  priceLabel?: string;
  pricePlaceholder?: string;
  addButtonText?: string;
  removeButtonTitle?: string;
  itemErrors?: Record<number, string>;
}>();

// Default values for props
const title = props.title || '材料 (可選)';
const namePlaceholder = props.namePlaceholder || '材料名稱';
const quantityLabel = props.quantityLabel || '數量';
const quantityPlaceholder = props.quantityPlaceholder || '輸入數量';
const priceLabel = props.priceLabel || '單價';
const pricePlaceholder = props.pricePlaceholder || '輸入單價';
const addButtonText = props.addButtonText || '添加材料';
const removeButtonTitle = props.removeButtonTitle || '移除材料';
const itemErrors = props.itemErrors || ref<Record<number, string>>({});

// Emits
const emit = defineEmits<{
  (e: 'update:modelValue', value: Item[]): void;
  (e: 'add'): void;
  (e: 'remove', index: number): void;
}>();

// Watch for changes to update the parent component
watch(
  () => props.modelValue,
  (newValue) => {
    emit('update:modelValue', newValue);
  },
  { deep: true }
);

// Add a new material
const addItem = () => {
  const newItems = [
    ...props.modelValue,
    {
      name: '',
      quantity: undefined,
      unitPrice: undefined,
    },
  ];
  emit('update:modelValue', newItems);
  emit('add');
};

// Remove an item
const removeItem = (index: number) => {
  const newItems = [...props.modelValue];
  newItems.splice(index, 1);
  emit('update:modelValue', newItems);
  emit('remove', index);
};

// Expose methods
defineExpose({
  addItem,
  removeItem,
});
</script>

<style scoped></style>
