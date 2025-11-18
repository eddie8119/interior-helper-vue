<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8">
      <div class="text-center">
        <div v-if="isLoading" class="space-y-4">
          <div
            class="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"
          />
          <h2 class="text-xl font-semibold text-gray-900">{{ t('title.sso_processing') }}</h2>
          <p class="text-sm text-gray-600">{{ t('message.sso_processing') }}</p>
        </div>

        <div v-else-if="error" class="space-y-4">
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-900">{{ t('title.sso_error') }}</h2>
          <p class="text-sm text-gray-600">{{ error }}</p>
          <button
            class="inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            @click="redirectToLogin"
          >
            {{ t('button.back_to_login') }}
          </button>
        </div>

        <div v-else-if="success" class="space-y-4">
          <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <svg
              class="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-gray-900">{{ t('title.sso_success') }}</h2>
          <p class="text-sm text-gray-600">{{ t('message.sso_success') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { authApi } from '@/api/auth';
import { SSO_PROVIDERS, type SsoProvider } from '@/constants/provider';
import { useAuthStore } from '@/stores/auth';
import { setAccessToken, setRefreshToken } from '@/utils/auth';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(true);
const error = ref<string | null>(null);
const success = ref(false);

const redirectToLogin = () => {
  router.replace('/auth/login');
};

const handleSsoCallback = async () => {
  try {
    const { provider, code } = route.query;

    if (!provider || !code) {
      throw new Error('缺少必要的授權參數');
    }

    if (typeof provider !== 'string' || typeof code !== 'string') {
      throw new Error('授權參數格式錯誤');
    }

    if (!SSO_PROVIDERS.includes(provider as SsoProvider)) {
      throw new Error('不支援的 SSO 提供商');
    }

    const response = await authApi.ssoCallback(provider as SsoProvider, code);

    if (response.success && response.data) {
      const { access_token, refresh_token } = response.data;

      setRefreshToken(refresh_token);
      setAccessToken(access_token);
      authStore.setAuth(true);

      success.value = true;

      // 延遲跳轉以顯示成功訊息
      setTimeout(() => {
        const redirectParam = route.query.state;
        const redirectTo =
          typeof redirectParam === 'string' && redirectParam.length > 0
            ? redirectParam
            : '/overview';
        router.replace(redirectTo);
      }, 2000);
    } else {
      throw new Error(response.message || 'SSO 登入失敗');
    }
  } catch (err) {
    console.error('SSO callback error:', err);
    error.value = err instanceof Error ? err.message : 'SSO 登入過程中發生錯誤';
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  handleSsoCallback();
});
</script>
