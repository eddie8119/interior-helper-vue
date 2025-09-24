<template>
  <div class="relative">
    <input
      v-model="todoContent"
      type="text"
      placeholder="輸入待辦事項"
      class="w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-3 pr-12 text-gray-700 placeholder-gray-400 transition-all duration-200 focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
      @keyup.enter="addTodo"
    />
    <button
      class="absolute right-2 top-1/2 -translate-y-1/2 rounded-md bg-blue-500 p-2 text-white shadow-md transition-all duration-200 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 disabled:opacity-50"
      :disabled="!todoContent.trim()"
      aria-label="添加待辦事項"
      @click="addTodo"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
          clip-rule="evenodd"
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import type { TodoItem } from '@/stores/todo';

const emit = defineEmits<{ (e: 'add-todo', todo: TodoItem): void }>();

const todoContent = ref('');
const addTodo = () => {
  if (todoContent.value.trim() === '') return;
  const todo: TodoItem = {
    id: Date.now(),
    content: todoContent.value.trim(),
    completed: false,
  };
  todoContent.value = '';
  emit('add-todo', todo);
};
</script>
