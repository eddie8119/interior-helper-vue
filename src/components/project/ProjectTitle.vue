<template>
  <div v-if="!isEditingTitle">
    <button
      class="inline-flex items-center gap-2 rounded-md text-2xl font-bold transition-all duration-300 ease-in-out hover:bg-slate-200"
      @click="startEditing"
    >
      <span>{{ title }} 工程案</span>
      <EditIcon />
    </button>
  </div>

  <div v-else class="flex place-items-center">
    <input
      ref="titleInputRef"
      v-model="tempTitle"
      type="text"
      class="block w-[230px] rounded-lg border border-gray-300 bg-gray-50 p-2 text-xl text-gray-900 focus:border-blue-500 focus:ring-blue-500"
      placeholder="工程案名稱"
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
  title: string;
}>();

const emit = defineEmits<{
  (e: 'update:title', value: string): void;
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
} = useEditableTitle(props, emit, 'title');
</script>

<style scoped>
.title-edit input {
  transition: none;
}
</style>
