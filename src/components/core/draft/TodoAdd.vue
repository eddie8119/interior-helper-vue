<template>
  <div class="relative">
    <input
      v-model="todoContent"
      type="text"
      :placeholder="t('placeholder.draft.todo')"
      class="background-color-difference text-color-difference w-full rounded-lg border-2 border-gray-200 px-4 py-3 pr-12 text-gray-700 placeholder-gray-400 transition-all duration-200 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
      @keyup.enter="addTodo"
    />
    <button
      class="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-blue-500 p-2 text-white shadow-md transition-all duration-200 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 disabled:opacity-50"
      :disabled="!todoContent.trim()"
      aria-label="添加待辦事項"
      @click="addTodo"
    >
      <PlusIcon />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { TodoItemDraft } from '@/types/todo';

import PlusIcon from '@/components/ui/PlusIcon.vue';

const emit = defineEmits<{ (e: 'add-todo-draft', todo: TodoItemDraft): void }>();

const { t } = useI18n();

const todoContent = ref<string>('');
const addTodo = () => {
  if (todoContent.value.trim() === '') return;
  const todo: TodoItemDraft = {
    id: Date.now().toString(),
    content: todoContent.value.trim(),
    completed: false,
    isMoved: false,
  };
  todoContent.value = '';
  emit('add-todo-draft', todo);
};
</script>
