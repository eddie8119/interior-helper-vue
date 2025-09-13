<template>
  <Transition name="fade" mode="out-in">
    <div v-if="!isEditingTitle">
      <span
        class="rounded-md text-3xl font-bold transition-all duration-300 ease-in-out hover:cursor-pointer hover:bg-slate-200"
        @click="startEditing"
      >
        {{ title }} 工程案
      </span>
    </div>
    <div v-else class="flex place-items-center">
      <input
        ref="titleInputRef"
        v-model="editableTitle"
        type="text"
        class="block w-[230px] rounded-lg border border-gray-300 bg-gray-50 p-2 text-xl text-gray-900 transition duration-300 ease-in-out focus:border-blue-500 focus:ring-blue-500"
        placeholder="工程案取名"
        @focus="onInputFocus"
        @blur="saveTitle"
        @change="saveTitle"
        @touchmove="saveTitle"
      />
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, nextTick, watch } from 'vue';

const props = defineProps<{
  title?: string;
}>();

const emit = defineEmits<{
  (e: 'update:title', value: string): void;
}>();

const isEditingTitle = ref(false);
const editableTitle = ref(props.title || '');
const titleInputRef = ref<HTMLInputElement | null>(null);

// 監聽 props.title 的變化
watch(
  () => props.title,
  (newTitle: string | undefined) => {
    editableTitle.value = newTitle || '';
  }
);

const startEditing = () => {
  isEditingTitle.value = true;
  // 使用 nextTick 確保 DOM 更新後再獲取元素
  nextTick(() => {
    if (titleInputRef.value) {
      titleInputRef.value.focus();
      titleInputRef.value.select();
    }
  });
};

const onInputFocus = (event: FocusEvent) => {
  // 安全地轉換 event.target 為 HTMLInputElement
  const input = event.target as HTMLInputElement;
  if (input && typeof input.select === 'function') {
    input.select();
  }
};

const saveTitle = () => {
  isEditingTitle.value = false;
  if (editableTitle.value !== props.title) {
    emit('update:title', editableTitle.value);
  }
};
</script>
