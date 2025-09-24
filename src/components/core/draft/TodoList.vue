<template>
  <transition-group name="todo-list" tag="div" class="space-y-3">
    <TodoItem
      v-for="todo in todos"
      :key="todo.id"
      :todo-item="todo"
      class="todo-list-item"
      @change-state="todo.completed = $event.target.checked"
    />
  </transition-group>
</template>

<script setup lang="ts">
import TodoItem from './TodoItem.vue';

import type { TodoItem as TodoItemType } from '@/stores/todo';

defineProps({
  todos: {
    type: Array as () => TodoItemType[],
    required: true,
  },
});
</script>

<style scoped>
.todo-list-enter-active,
.todo-list-leave-active {
  transition: all 0.3s ease;
}

.todo-list-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.todo-list-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

.todo-list-move {
  transition: transform 0.5s ease;
}
</style>
