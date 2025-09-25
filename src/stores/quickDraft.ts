import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface TodoItemDraft {
  id: string;
  content: string;
  completed: boolean;
}

export const useQuickDraftStore = defineStore('quickDraft', () => {
  const isQuickDraftSlideVisible = ref(false);

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
    isQuickDraftSlideVisible,
    toggleQuickDraftSlide,
    showQuickDraftSlide,
    hideQuickDraftSlide,
  };
});
