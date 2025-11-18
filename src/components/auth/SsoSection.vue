<template>
  <!-- SSO 登入分隔線 -->
  <div class="my-6 flex items-center">
    <div class="flex-1 border-t border-gray-300" />
    <span class="px-4 text-sm text-gray-500">{{ t('label.or') }}</span>
    <div class="flex-1 border-t border-gray-300" />
  </div>

  <!-- SSO 登入按鈕（圓形，使用迴圈） -->
  <div class="mb-4 flex items-center justify-center gap-3">
    <button
      v-for="p in providers"
      :key="p"
      type="button"
      class="flex h-12 w-12 items-center justify-center rounded-full border border-gray-300 bg-white text-gray-700 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      :aria-label="t(labelKey[p])"
      @click="emit('sso-login', p)"
    >
      <!-- Google Icon -->
      <svg v-if="p === 'google'" class="block h-7 w-7" viewBox="0 0 24 24">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        />
      </svg>
      <!-- Facebook Icon -->
      <svg v-else-if="p === 'facebook'" class="block h-7 w-7" viewBox="0 0 24 24" fill="#1877F2">
        <path
          d="M22 12.06C22 6.48 17.52 2 11.94 2 6.36 2 1.88 6.48 1.88 12.06c0 5.02 3.67 9.19 8.47 10v-7.07H7.9v-2.93h2.45V9.41c0-2.42 1.44-3.75 3.64-3.75 1.06 0 2.18.19 2.18.19v2.4h-1.23c-1.21 0-1.58.75-1.58 1.52v1.82h2.69l-.43 2.93h-2.26V22c4.8-.81 8.47-4.98 8.47-9.94z"
        />
      </svg>
      <!-- Apple Icon -->
      <svg
        v-else
        class="block h-7 w-7 shrink-0 -translate-x-[2px] -translate-y-[3px] scale-95"
        viewBox="0 0 24 24"
        fill="currentColor"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          d="M16.365 1.43c0 1.14-.47 2.23-1.26 3.06-.81.84-2.12 1.49-3.24 1.4-.14-1.07.54-2.2 1.3-2.92.83-.78 2.27-1.35 3.2-1.54zm4.57 17.21c-.41.95-.9 1.85-1.48 2.72-.78 1.15-1.79 2.58-3.1 2.6-1.16.02-1.46-.75-3.05-.75-1.6 0-1.92.73-3.08.77-1.33.06-2.35-1.25-3.13-2.4-1.7-2.47-3.01-6.99-1.25-10.05.87-1.52 2.43-2.47 4.15-2.5 1.3-.03 2.53.86 3.05.86.5 0 2.11-1.06 3.55-.9.6.02 2.28.24 3.36 1.86-3.06 1.67-2.57 6.06.98 7.79z"
        />
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import { SSO_PROVIDERS, type SsoProvider } from '@/constants/provider';

const emit = defineEmits<{
  (e: 'sso-login', provider: SsoProvider): void;
}>();

const providers: SsoProvider[] = [...SSO_PROVIDERS];

const { t } = useI18n();
const labelKey: Record<SsoProvider, string> = {
  google: 'button.sso.google',
  facebook: 'button.sso.facebook',
  apple: 'button.sso.apple',
};
</script>
