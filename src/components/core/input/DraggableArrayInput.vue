<template>
  <div class="space-y-2">
    <Label :label="title" />
    <Container
      class="flex flex-col gap-2"
      drag-handle-selector=".drag-handle"
      lock-axis="y"
      :drop-placeholder="{
        className: 'drop-preview',
        animationDuration: '150',
        showOnTop: true,
      }"
      @drop="onDrop"
    >
      <Draggable v-for="(item, index) in modelValue" :key="getItemKey(item, index)">
        <div class="flex flex-col space-y-2">
          <div class="flex items-center gap-2">
            <!-- 拖拽手柄 -->
            <button
              class="drag-handle cursor-move text-gray-400 hover:text-gray-600"
              type="button"
              :aria-label="t('common.drag')"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 8h16M4 16h16"
                />
              </svg>
            </button>

            <!-- 輸入框 -->
            <input
              v-model="item.name"
              type="text"
              class="input-border input-common flex-1 p-1"
              :placeholder="t(namePlaceholder)"
            />

            <!-- 刪除按鈕 -->
            <button
              class="text-secondary-red hover:text-red-700"
              type="button"
              :aria-label="t('common.delete')"
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

          <!-- Slot for additional inputs -->
          <slot name="inputs" :item="item" :index="index" />

          <div v-if="itemErrors && itemErrors[index]" class="text-xs text-secondary-red">
            {{ itemErrors[index] }}
          </div>
        </div>
      </Draggable>
    </Container>

    <!-- 添加按鈕 -->
    <button
      class="flex w-full items-center justify-center rounded-md border border-dashed border-gray-300 p-2 text-sm text-gray-500 hover:bg-gray-100"
      type="button"
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
import { Container, Draggable, type DropResult } from 'vue3-smooth-dnd';

import type { Item } from '@/types/input';

import Label from '@/components/core/title/Label.vue';
import { applyDrag } from '@/utils/dragDrop';

// mark Item as used in <script> scope to avoid "declared but its value is never read"
type __ItemMarker = Item;

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

/**
 * 獲取項目的唯一 key
 */
const getItemKey = (item: T, index: number): string => {
  // 如果項目有 id 屬性，使用它；否則使用索引
  return 'id' in item && item.id ? String(item.id) : `item-${index}`;
};

/**
 * 處理拖拽放置
 */
const onDrop = (dropResult: DropResult) => {
  const newItems = applyDrag(props.modelValue, dropResult);
  emit('update:modelValue', newItems);
};

/**
 * 添加新項目
 */
const addItem = () => {
  const newItems = [...props.modelValue, props.newItemFactory()];
  emit('update:modelValue', newItems);
};

/**
 * 刪除項目
 */
const removeItem = (index: number) => {
  const newItems = [...props.modelValue];
  newItems.splice(index, 1);
  emit('update:modelValue', newItems);
};
</script>

<style scoped></style>
