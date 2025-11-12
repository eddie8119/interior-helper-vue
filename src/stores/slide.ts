import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSlideStore = defineStore('slide', () => {
  // Quick Draft slide
  const isQuickDraftSlideVisible = ref(false);

  const toggleQuickDraftSlide = () => {
    isQuickDraftSlideVisible.value = !isQuickDraftSlideVisible.value;
  };
  const showQuickDraftSlide = () => {
    isQuickDraftSlideVisible.value = true;
  };
  const hideQuickDraftSlide = () => {
    isQuickDraftSlideVisible.value = false;
  };

  // Notification slide
  const isNotificationSlideVisible = ref(false);

  const toggleNotificationSlide = () => {
    isNotificationSlideVisible.value = !isNotificationSlideVisible.value;
  };
  const showNotificationSlide = () => {
    isNotificationSlideVisible.value = true;
  };
  const hideNotificationSlide = () => {
    isNotificationSlideVisible.value = false;
  };

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
