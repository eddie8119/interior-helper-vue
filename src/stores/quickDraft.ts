import { defineStore } from 'pinia';
import { ref } from 'vue';

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
