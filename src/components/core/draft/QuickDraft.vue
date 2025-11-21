<template>
  <div
    class="panel-container h-full w-full max-w-md rounded-xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl sm:p-8"
  >
    <H1Title :title="t('title.quick_draft')" class-name="text-center mb-6" />
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
        filter === 'all'
          ? t('message.no_todo')
          : filter === 'done'
            ? t('message.no_done')
            : t('message.no_undone')
      }}
    </div>

    <div class="max-h-[calc(100vh-350px)] overflow-y-auto pr-1">
      <TransitionGroup name="todo-list" tag="div" class="space-y-3">
        <TodoItem
          v-for="todo in filteredTodos"
          :key="todo.id"
          :todo-item="todo"
          class="todo-list-item"
          @update:todo-item="updateTodo"
        />
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onActivated, onDeactivated, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import TodoAdd from './TodoAdd.vue';
import TodoFilter from './TodoFilter.vue';
import TodoItem from './TodoItem.vue';

import type { DraftResponse } from '@/types/response';
import type { TodoFilterType, TodoItemDraft } from '@/types/todo';

import H1Title from '@/components/core/title/H1Title.vue';
import { useDraft } from '@/composables/query/useDraft';
import { useLocalStorageRef } from '@/composables/useLocalStorage';

const LOCAL_STORAGE_KEY = 'quick_draft_todos';

const { t } = useI18n();
const { draft, createDraft, updateDraft } = useDraft();
const { state: todos } = useLocalStorageRef<TodoItemDraft[]>(LOCAL_STORAGE_KEY, []);

onActivated(() => {
  // 監聽來自 API 的草稿數據
  const unwatch = watch(draft, (newDraft) => {
    if (newDraft) {
      // 如果本地沒有數據，或後端數據較新，則使用後端數據
      // 這裡簡化為：如果本地為空，則使用後端數據
      if (todos.value.length === 0 && newDraft.tasks) {
        todos.value = newDraft.tasks as unknown as TodoItemDraft[];
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

const addTodoDraft = (todo: TodoItemDraft) => {
  todos.value.push(todo);
};

const updateTodo = (updatedTodo: TodoItemDraft) => {
  const index = todos.value.findIndex((t) => t.id === updatedTodo.id);
  if (index !== -1) {
    todos.value[index] = { ...todos.value[index], ...updatedTodo };
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
