<template>
  <div v-if="!isEditingTitle">
    <button
      :class="[
        'inline-flex items-center gap-1 rounded-md py-1 text-lg font-semibold transition-all duration-300 ease-in-out',
        !readOnly ? 'hover:bg-slate-200' : '',
      ]"
      @click="!readOnly && onStartEditing()"
    >
      {{ title }}{{ t('project.construction') }}
      <EditIcon v-if="!readOnly" :size="'h-3 w-3'" />
    </button>
  </div>

  <div v-else class="flex place-items-center">
    <input
      ref="titleInputRef"
      v-model="tempTitle"
      type="text"
      class="block w-[150px] rounded-lg border border-gray-300 bg-gray-50 p-1 text-lg text-gray-900 focus:border-blue-500 focus:ring-blue-500"
      :placeholder="t('placeholder.project.construction')"
      @focus="onInputFocus"
      @blur="onBlur"
      @keyup.enter="onSave"
      @keyup.esc="onCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import EditIcon from '@/components/ui/EditIcon.vue';
import { useEditableTitle } from '@/composables/useEditableTitle';

const props = defineProps<{
  constructionName: string;
  readOnly?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:construction-name', value: string): void;
  (e: 'editing-change', value: boolean): void;
}>();

const { t } = useI18n();
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

// Wrap handlers to emit editing state to parent
const onStartEditing = () => {
  startEditing();
  emit('editing-change', true);
};

const onSave = () => {
  saveTitle();
  emit('editing-change', false);
};

const onCancel = () => {
  cancelEdit();
  emit('editing-change', false);
};

const onBlur = () => {
  isEditingTitle.value = false;
  emit('editing-change', false);
};
</script>

<style scoped>
.title-edit input {
  transition: none;
}
</style>
