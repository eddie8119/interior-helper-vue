<template>
  <div
    class="panel-container h-full w-full max-w-md rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl sm:p-8"
  >
    <H1Title title="工地待辦事項速記" class-name="text-center mb-6" />

    <TodoAdd class="mb-6" @add-todo-draft="addTodoDraft" />

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
        filter === 'all' ? '沒有待辦事項' : filter === 'done' ? '沒有已完成事項' : '沒有未完成事項'
      }}
    </div>
    <TodoList
      v-else
      :todos="filteredTodos"
      @change-state="updateTodoDraft"
      class="max-h-[calc(100vh-350px)] overflow-y-auto pr-1"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, ref } from 'vue';

import TodoAdd from './TodoAdd.vue';
import TodoFilter from './TodoFilter.vue';
import TodoList from './TodoList.vue';

import type { TodoItemDraft } from '@/stores/quickDraft';

import H1Title from '@/components/core/title/H1Title.vue';
import { useQuickDraftStore } from '@/stores/quickDraft';

const quickDraftStore = useQuickDraftStore();
const { todo: getTodosDraft } = storeToRefs(quickDraftStore);

const addTodoDraft = (todo: TodoItemDraft) => {
  const newTodos = [...getTodosDraft.value, todo];
  quickDraftStore.setTodoDraft(newTodos);
};

const updateTodoDraft = (id: string, event: Event) => {
  const isChecked = (event.target as HTMLInputElement).checked;
  const updatedTodos = getTodosDraft.value.map((todo: TodoItemDraft) =>
    todo.id === id ? { ...todo, completed: isChecked } : todo
  );
  quickDraftStore.setTodoDraft(updatedTodos);
};

const clearDone = () => {
  const filtered = getTodosDraft.value.filter((todo: TodoItemDraft) => !todo.completed);
  quickDraftStore.setTodoDraft(filtered);
};

const filter = ref('all');
const filteredTodos = computed(() => {
  switch (filter.value) {
    case 'done':
      return getTodosDraft.value.filter((todo: TodoItemDraft) => todo.completed);
    case 'todo':
      return getTodosDraft.value.filter((todo: TodoItemDraft) => !todo.completed);
    default:
      return getTodosDraft.value;
  }
});
</script>
