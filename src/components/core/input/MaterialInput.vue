<template>
  <DraggableArrayInput
    :model-value="modelValue"
    :title="t('label.materials')"
    :new-item-factory="newItemFactory"
    :name-placeholder="namePlaceholder"
    :add-button-text="addButtonText"
    :item-errors="itemErrors"
    @update:model-value="onUpdate"
  >
    <template #inputs="{ item }">
      <div class="grid grid-cols-2 gap-2">
        <div class="flex items-center">
          <span class="text200-color-difference mr-1 text-xs">{{ quantityLabel }}:</span>

          <input
            v-model.number="item.quantity"
            type="number"
            min="1"
            class="input-border input-common w-20 p-1 text-sm"
            :placeholder="quantityPlaceholder"
          />
        </div>
        <div class="flex items-center">
          <span class="text200-color-difference mr-1 text-xs">{{ unitLabel }}:</span>
          <select v-model="item.unit" class="input-border input-common w-20 p-1 text-sm">
            <option value="" disabled hidden>{{ unitPlaceholder }}</option>
            <option v-for="opt in commonStore.unitItems" :key="opt" :value="opt">{{ opt }}</option>
          </select>
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
  </DraggableArrayInput>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import DraggableArrayInput from './DraggableArrayInput.vue';

import type { Item as BasicItem } from './DraggableArrayInput.vue';

import { useCommonStore } from '@/stores/common';

export interface Item extends BasicItem {
  quantity?: number;
  unitPrice?: number;
  unit?: string;
}

withDefaults(
  defineProps<{
    modelValue: Item[];
    namePlaceholder?: string;
    quantityLabel?: string;
    quantityPlaceholder?: string;
    priceLabel?: string;
    pricePlaceholder?: string;
    unitLabel?: string;
    unitPlaceholder?: string;
    addButtonText?: string;
    itemErrors?: Record<number, string>;
  }>(),
  {
    namePlaceholder: '材料名稱',
    quantityLabel: '數量',
    quantityPlaceholder: '輸入',
    priceLabel: '單價',
    pricePlaceholder: '輸入',
    unitLabel: '單位',
    unitPlaceholder: '選取',
    addButtonText: '添加材料',
    itemErrors: () => ({}),
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: Item[]): void;
}>();

const { t } = useI18n();
const commonStore = useCommonStore();

const newItemFactory = (): Item => ({
  name: '',
  quantity: undefined,
  unitPrice: undefined,
  unit: '',
});

const onUpdate = (value: Item[]) => {
  emit('update:modelValue', value);
};
</script>

<style scoped></style>
