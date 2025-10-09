<template>
  <div v-if="!isEditingTitle">
    <button
      class="inline-flex items-center gap-1 rounded-md py-1 text-lg font-semibold transition-all duration-300 ease-in-out hover:bg-slate-200"
      @click="startEditing"
    >
      {{ title }}工程
      <EditIcon :size="'h-3 w-3'" />
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
import EditIcon from '@/components/ui/EditIcon.vue';
import { useEditableTitle } from '@/composables/useEditableTitle';

const props = defineProps<{
  constructionName: string;
}>();

const emit = defineEmits<{
  (e: 'update:construction-name', value: string): void;
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
} = useEditableTitle(props, emit, 'constructionName');
</script>

<style scoped>
.title-edit input {
  transition: none;
}
</style>
