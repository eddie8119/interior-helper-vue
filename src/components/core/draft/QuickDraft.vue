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

    <div class="max-h-[calc(100vh-350px)] overflow-y-auto pr-1">
      <transition-group name="todo-list" tag="div" class="space-y-3">
        <TodoItemComponent
          v-for="todo in filteredTodos"
          :key="todo.id"
          :todo-item="todo"
          class="todo-list-item"
          @change-state="updateTodoDraft(todo.id, $event)"
        />
      </transition-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onActivated, onDeactivated, ref, watch } from 'vue';

import TodoAdd from './TodoAdd.vue';
import TodoFilter from './TodoFilter.vue';
import TodoItemComponent from './TodoItem.vue';

import type { DraftResponse } from '@/types/response';
import type { TodoFilterType, TodoItem } from '@/types/todo';

import H1Title from '@/components/core/title/H1Title.vue';
import { useDraft } from '@/composables/useDraft';
import { useLocalStorageRef } from '@/composables/useLocalStorage';

const LOCAL_STORAGE_KEY = 'quick_draft_todos';

const { draft, createDraft, updateDraft } = useDraft();

const { state: todos } = useLocalStorageRef<TodoItem[]>(LOCAL_STORAGE_KEY, []);

onActivated(() => {
  // 監聽來自 API 的草稿數據
  const unwatch = watch(draft, (newDraft) => {
    if (newDraft) {
      // 如果本地沒有數據，或後端數據較新，則使用後端數據
      // 這裡簡化為：如果本地為空，則使用後端數據
      if (todos.value.length === 0 && newDraft.tasks) {
        todos.value = newDraft.tasks as unknown as TodoItem[];
      }
      // 停止監聽，避免覆蓋本地的後續更改
      unwatch();
    }
  });
});

onDeactivated(async () => {
  const localData = todos.value;
  if (!localData) return;

  const payload: Partial<DraftResponse> = {
    tasks: localData as unknown as JSON[],
  };

  if (draft.value && draft.value.id) {
    // 如果存在草稿 ID，則更新
    await updateDraft(draft.value.id, payload);
  } else if (localData.length > 0) {
    // 否則，如果本地有數據，則創建新草稿
    await createDraft(payload);
  }
});

const addTodoDraft = (todo: TodoItem) => {
  todos.value.push(todo);
};

const updateTodoDraft = (id: string, event: Event) => {
  const isChecked = (event.target as HTMLInputElement).checked;
  const todo = todos.value.find((t) => t.id === id);
  if (todo) {
    todo.completed = isChecked;
  }
};

const clearDone = () => {
  todos.value = todos.value.filter((todo) => !todo.completed);
};

const filter = ref<TodoFilterType>('all');
const filteredTodos = computed(() => {
  switch (filter.value) {
    case 'done':
      return todos.value.filter((todo) => todo.completed);
    case 'todo':
      return todos.value.filter((todo) => !todo.completed);
    default:
      return todos.value;
  }
});
</script>
