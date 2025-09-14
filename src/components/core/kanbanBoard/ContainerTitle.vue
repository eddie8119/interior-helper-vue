<template>
  <div v-if="!isEditingTitle">
    <button
      @click="startEditing"
      class="inline-block rounded-md py-1 text-lg font-semibold transition-all duration-300 ease-in-out hover:bg-slate-200"
    >
      {{ title }}工程
    </button>
  </div>

  <div v-else class="flex place-items-center">
    <input
      ref="titleInputRef"
      v-model="tempTitle"
      type="text"
      class="block w-[150px] rounded-lg border border-gray-300 bg-gray-50 p-1 text-lg text-gray-900 focus:border-blue-500 focus:ring-blue-500"
      placeholder="工程名稱"
      @focus="onInputFocus"
      @blur="isEditingTitle = false"
      @keyup.enter="saveTitle"
      @keyup.esc="cancelEdit"
    />
  </div>
</template>

<script setup lang="ts">
import { useEditableTitle } from '@/composables/useEditableTitle';

const props = defineProps<{
  name: string;
}>();

const emit = defineEmits<{
  (e: 'update:name', value: string): void;
}>();

// 使用可編輯標題的共用邏輯
const {
  isEditingTitle,
  tempTitle,
  titleInputRef,
  title,
  startEditing,
  onInputFocus,
  saveTitle,
  cancelEdit,
} = useEditableTitle(props, emit, 'name');
</script>

<style scoped>
.title-edit input {
  transition: none;
}
</style>
