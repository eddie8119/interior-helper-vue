<template>
  <div
    v-if="!isEditing"
    class="mx-2 flex min-w-[300px] max-w-[300px] cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-gray-300 p-3 hover:border-gray-400"
    @click="startEditing"
  >
    <div class="text-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="mx-auto h-10 w-10 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
        />
      </svg>
      <span class="mt-2 block text-gray-500">新增工程類型</span>
    </div>
  </div>

  <div v-else class="mx-2 min-w-[300px] max-w-[300px] rounded-lg bg-gray-100 p-3 shadow-sm">
    <div class="flex flex-col space-y-3">
      <input
        ref="inputRef"
        v-model="newContainerName"
        type="text"
        class="block w-full rounded-lg border border-gray-300 bg-white p-2 text-lg text-gray-900 focus:border-blue-500 focus:ring-blue-500"
        :placeholder="t('placeholder.project.addContainer')"
        @keyup.enter="addNewContainer"
        @keyup.esc="cancelEditing"
      />

      <div class="flex justify-between">
        <button
          class="rounded-md bg-gray-200 px-3 py-1 text-gray-700 hover:bg-gray-300"
          @click="cancelEditing"
        >
          {{ t('button.cancel') }}
        </button>
        <button
          class="rounded-md bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
          :disabled="!isValidName"
          @click="addNewContainer"
        >
          {{ t('button.add') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { useEditingStateStore } from '@/stores/editingState';

const { t } = useI18n();

const props = defineProps<{
  id: string;
}>();

const emit = defineEmits<{ (e: 'add-container', name: string): void }>();

const editingStateStore = useEditingStateStore();
const newContainerName = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

// 使用計算屬性來判斷是否處於編輯狀態
const isEditing = computed(() => {
  return editingStateStore.isEditing('container', props.id);
});

// 計算屬性：確保名稱有效
const isValidName = computed(() => newContainerName.value.trim().length > 0);

// 開始編輯模式
const startEditing = () => {
  editingStateStore.startEditing('container', props.id);
  newContainerName.value = '';

  // 等待 DOM 更新後聚焦輸入框
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus();
    }
  });
};

// 添加新容器
const addNewContainer = () => {
  if (isValidName.value) {
    emit('add-container', newContainerName.value.trim());
    resetForm();
  }
};

// 取消編輯
const cancelEditing = () => {
  resetForm();
};

// 重置表單
const resetForm = () => {
  newContainerName.value = '';
  editingStateStore.stopEditing();
};
</script>

<style scoped></style>
