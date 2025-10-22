<template>
  <RouterView />
  <QuickDraftSlide v-if="shouldShowQuickDraft" />
  <QuickDraftToggle v-if="shouldShowQuickDraft" />
  <NotificationSlide v-if="shouldShowNotification" />
</template>

<script setup lang="ts">
import { provide } from 'vue';

import QuickDraftSlide from '@/components/core/draft/QuickDraftSlide.vue';
import QuickDraftToggle from '@/components/core/draft/QuickDraftToggle.vue';
import NotificationSlide from '@/components/notification/NotificationSlide.vue';
import { useGlobalUI } from '@/composables/useGlobalUI';
import { useAuthStore } from '@/stores/auth';

// Initialize global state
const authStore = useAuthStore();
authStore.initializeAuthState();

// Global UI logic
const { isDarkMode, shouldShowQuickDraft, shouldShowNotification, setTheme } = useGlobalUI();

provide('toggleTheme', () => {
  isDarkMode.value = !isDarkMode.value;
  setTheme(isDarkMode.value);
});

// Provide theme to child components
provide('isDarkMode', isDarkMode);
</script>
