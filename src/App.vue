<template>
  <RouterView />
  <QuickDraftSlide v-if="!isQuickDraftPage" />
  <QuickDraftToggle v-if="!isQuickDraftPage" />
</template>

<script setup lang="ts">
import { provide, ref, computed } from 'vue';
import { useRoute } from 'vue-router';

import QuickDraftSlide from '@/components/core/draft/QuickDraftSlide.vue';
import QuickDraftToggle from '@/components/core/draft/QuickDraftToggle.vue';
import { useAuthStore } from '@/stores/auth';
import { initTheme, setTheme } from '@/utils/theme';

const route = useRoute();
const authStore = useAuthStore();
authStore.initializeAuthState();

const isQuickDraftPage = computed(() => route.path === '/todo/quick-draft');

// 主題顏色
const isDarkMode = ref<boolean>(initTheme());
provide('isDarkMode', isDarkMode);

provide('toggleTheme', () => {
  isDarkMode.value = !isDarkMode.value;
  setTheme(isDarkMode.value);
});
</script>
