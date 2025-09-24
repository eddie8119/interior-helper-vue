import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface TodoItem {
  id: string;
  content: string;
  completed: boolean;
}

function loadTodo(): TodoItem[] {
  try {
    const saved = localStorage.getItem('myTodo');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export const useTodoStore = defineStore('todo', () => {
  const todo = ref<TodoItem[]>(loadTodo());
  const showTodoSlide = ref(false);

  function setTodo(data: TodoItem[]) {
    todo.value = data;
    localStorage.setItem('myTodo', JSON.stringify(data));
  }

  function toggleTodoSlide() {
    showTodoSlide.value = !showTodoSlide.value;
  }

  function clearShowTodoSlide() {
    showTodoSlide.value = false;
  }

  return {
    todo,
    showTodoSlide,
    setTodo,
    toggleTodoSlide,
    clearShowTodoSlide,
  };
});

export const useQuickDraftStore = defineStore('quickDraft', () => {
  const isQuickDraftSlideVisible = ref(false);

  function toggleQuickDraftSlide() {
    isQuickDraftSlideVisible.value = !isQuickDraftSlideVisible.value;
  }

  function showQuickDraftSlide() {
    isQuickDraftSlideVisible.value = true;
  }

  function hideQuickDraftSlide() {
    isQuickDraftSlideVisible.value = false;
  }

  return {
    isQuickDraftSlideVisible,
    toggleQuickDraftSlide,
    showQuickDraftSlide,
    hideQuickDraftSlide,
  };
});
