<template>
  <RouterView />
  <QuickDraftSlide v-if="!isQuickDraftPage" />
  <QuickDraftToggle v-if="!isQuickDraftPage" />
  <NotificationSlide />
</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue';
import { useRoute } from 'vue-router';

import QuickDraftSlide from '@/components/core/draft/QuickDraftSlide.vue';
import QuickDraftToggle from '@/components/core/draft/QuickDraftToggle.vue';
import NotificationSlide from '@/components/core/notification/NotificationSlide.vue';
import { useAuthStore } from '@/stores/auth';
import { initTheme, setTheme } from '@/utils/theme';

const route = useRoute();
const authStore = useAuthStore();
authStore.initializeAuthState();

const isQuickDraftPage = computed(() => {
  return (
    route.path === '/todo/quick-draft' ||
    route.path.startsWith('/auth/') ||
    route.path.startsWith('/shared/project')
  );
});

// 主題顏色
const isDarkMode = ref<boolean>(initTheme());
provide('isDarkMode', isDarkMode);

provide('toggleTheme', () => {
  isDarkMode.value = !isDarkMode.value;
  setTheme(isDarkMode.value);
});
</script>
