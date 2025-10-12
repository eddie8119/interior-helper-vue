import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSlideStore = defineStore('slide', () => {
  // Quick Draft slide
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

  // Notification slide
  const isNotificationSlideVisible = ref(false);

  function toggleNotificationSlide() {
    isNotificationSlideVisible.value = !isNotificationSlideVisible.value;
  }
  function showNotificationSlide() {
    isNotificationSlideVisible.value = true;
  }
  function hideNotificationSlide() {
    isNotificationSlideVisible.value = false;
  }

  return {
    // quick draft
    isQuickDraftSlideVisible,
    toggleQuickDraftSlide,
    showQuickDraftSlide,
    hideQuickDraftSlide,
    // notification
    isNotificationSlideVisible,
    toggleNotificationSlide,
    showNotificationSlide,
    hideNotificationSlide,
  };
});
