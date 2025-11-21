import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';

import { initTheme, setTheme } from '@/utils/theme';

export function useGlobalUI() {
  const route = useRoute();

  // Theme management
  const isDarkMode = ref<boolean>(initTheme());

  // Page condition logic
  const isQuickDraftPage = computed(() => {
    return (
      route.path === '/todo/quick_draft' ||
      route.path.startsWith('/auth/') ||
      route.path.startsWith('/shared/project')
    );
  });

  // Global component visibility
  const shouldShowQuickDraft = computed(() => !isQuickDraftPage.value);
  const shouldShowNotification = computed(() => true); // Always show notifications

  return {
    isDarkMode,
    isQuickDraftPage,
    shouldShowQuickDraft,
    shouldShowNotification,
    setTheme,
  };
}
