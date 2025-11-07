<template>
  <BasicArrayInput
    :model-value="modelValue"
    :title="titleText"
    :new-item-factory="newItemFactory"
    :name-placeholder="namePlaceholder"
    :add-button-text="addButtonText"
    :item-errors="itemErrors"
    @update:model-value="onUpdate"
  >
    <template #inputs="{ item }">
      <div class="flex items-center gap-2">
        <div class="flex items-center">
          <span class="text200-color-difference mr-1 text-xs">{{ quantityLabel }}:</span>

          <input
            v-model.number="item.quantity"
            type="number"
            min="1"
            class="input-border input-common w-16 p-1 text-sm"
            :placeholder="quantityPlaceholder"
          />
        </div>
        <div class="flex items-center">
          <span class="text200-color-difference mr-1 text-xs">{{ priceLabel }}:</span>
          <input
            v-model.number="item.unitPrice"
            type="number"
            min="0"
            class="input-border input-common w-20 p-1 text-sm"
            :placeholder="pricePlaceholder"
          />
        </div>
      </div>
    </template>
  </BasicArrayInput>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import BasicArrayInput from './BasicArrayInput.vue';

import type { Item as BasicItem } from './BasicArrayInput.vue';

export interface Item extends BasicItem {
  quantity?: number;
  unitPrice?: number;
}

withDefaults(
  defineProps<{
    modelValue: Item[];
    namePlaceholder?: string;
    quantityLabel?: string;
    quantityPlaceholder?: string;
    priceLabel?: string;
    pricePlaceholder?: string;
    addButtonText?: string;
    itemErrors?: Record<number, string>;
  }>(),
  {
    namePlaceholder: '材料名稱',
    quantityLabel: '數量',
    quantityPlaceholder: '輸入',
    priceLabel: '單價',
    pricePlaceholder: '輸入',
    addButtonText: '添加材料',
    itemErrors: () => ({}),
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: Item[]): void;
}>();

const { t } = useI18n();

const newItemFactory = (): Item => ({
  name: '',
  quantity: undefined,
  unitPrice: undefined,
});

const onUpdate = (value: Item[]) => {
  emit('update:modelValue', value);
};

const titleText = t('label.materials');
</script>

<style scoped></style>
