import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface TodoItemDraft {
  id: string;
  content: string;
  completed: boolean;
}

function loadTodoDraft(): TodoItemDraft[] {
  try {
    const saved = localStorage.getItem('myDraft');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export const useQuickDraftStore = defineStore('quickDraft', () => {
  const todo = ref<TodoItemDraft[]>(loadTodoDraft());
  const isQuickDraftSlideVisible = ref(false);

  function setTodoDraft(data: TodoItemDraft[]) {
    todo.value = data;
    localStorage.setItem('myDraft', JSON.stringify(data));
  }

  //slide
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
    todo,
    setTodoDraft,

    isQuickDraftSlideVisible,
    toggleQuickDraftSlide,
    showQuickDraftSlide,
    hideQuickDraftSlide,
  };
});
