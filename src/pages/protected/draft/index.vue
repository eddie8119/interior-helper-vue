<template>
  <div class="flex h-full w-full flex-col items-center">
    <div
      class="panel-container h-full w-full max-w-md rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl sm:p-8"
    >
      <H1Title title="工地待辦事項速記" class-name="text-center mb-6" />

      <TodoAdd class="mb-6" @add-todo="addTodo" />

      <TodoFilter
        :selected="filter"
        class="mb-4"
        @change-filter="filter = $event"
        @clear-done="clearDone"
      />

      <div
        v-if="filteredTodos.length === 0"
        class="flex h-40 items-center justify-center text-gray-400"
      >
        {{
          filter === 'all'
            ? '沒有待辦事項'
            : filter === 'done'
              ? '沒有已完成事項'
              : '沒有未完成事項'
        }}
      </div>
      <TodoList
        v-else
        :todos="filteredTodos"
        class="max-h-[calc(100vh-350px)] overflow-y-auto pr-1"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';

import type { TodoItem } from '@/stores/todo';

import TodoAdd from '@/components/core/draft/TodoAdd.vue';
import TodoFilter from '@/components/core/draft/TodoFilter.vue';
import TodoList from '@/components/core/draft/TodoList.vue';
import H1Title from '@/components/core/title/H1Title.vue';
import { useTodoStore } from '@/stores/todo';

const todoStore = useTodoStore();
const { todo: getTodos } = storeToRefs(todoStore);

const addTodo = (todo: TodoItem) => {
  const newTodos = [...getTodos.value, todo];
  todoStore.setTodo(newTodos);
};

const clearDone = () => {
  const filtered = getTodos.value.filter((todo) => !todo.completed);
  todoStore.setTodo(filtered);
};

const filter = ref('all');
const filteredTodos = computed(() => {
  switch (filter.value) {
    case 'done':
      return getTodos.value.filter((todo) => todo.completed);
    case 'todo':
      return getTodos.value.filter((todo) => !todo.completed);
    default:
      return getTodos.value;
  }
});
</script>
