<template>
  <AuthCard :loading="isLoading" :show-submit-button="false">
    <template #title>{{ t('title.account_activation') }}</template>

    <div v-if="activationStatus === 'success'" class="flex flex-col items-center">
      <img :src="check" alt="check" class="mb-4 h-16 w-16" />
      <p class="mb-4 text-lg">
        {{ t('message.dialog.activation_success') }}
      </p>
      <ElButton
        type="primary"
        class="auth-brand-button w-full"
        @click="router.push({ name: 'login' })"
      >
        {{ t('button.login') }}
      </ElButton>
    </div>

    <div v-else-if="activationStatus === 'error'" class="flex flex-col items-center">
      <img :src="close" alt="close" class="mb-4 h-16 w-16" />
      <p class="text-lg">{{ t('message.dialog.activation_error') }}</p>
      <p class="mb-4 text-sm text-secondary-red">
        {{ errorMessage }}
      </p>
      <ElButton
        type="primary"
        size="large"
        class="auth-brand-button w-full"
        block
        @click="reActivateAccount"
      >
        {{ t('button.try_again') }}
      </ElButton>
    </div>

    <div v-else class="text-center">
      <ElIcon class="mb-4 animate-spin text-4xl text-blue-500">
        <Loading />
      </ElIcon>
      <p class="text-lg">
        {{ t('message.dialog.activating') }}
      </p>
    </div>
  </AuthCard>
</template>

<script setup lang="ts">
import { Loading } from '@element-plus/icons-vue';
import { onActivated, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import { userApi } from '@/api/user';
import check from '@/assets/images/check.png';
import close from '@/assets/images/close.png';
import AuthCard from '@/components/auth/AuthCard.vue';
import { useAuthStore } from '@/stores/auth';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref<boolean>(false);
const errorMessage = ref<string>('');
const activationStatus = ref<'pending' | 'success' | 'error'>('pending');

const activateAccount = async () => {
  const { token, email } = route.query;
  if (!token || !email) {
    errorMessage.value = t('error.invalid_activation_link');
    activationStatus.value = 'error';
    return;
  }

  try {
    isLoading.value = true;
    await userApi.activateAccount({
      token: token as string,
      email: email as string,
    });
    activationStatus.value = 'success';
  } catch (error: any) {
    if (error?.response?.data?.message) {
      errorMessage.value = error.response.data.message;
    } else {
      errorMessage.value = t('error.activation_failed');
    }
    activationStatus.value = 'error';
  } finally {
    isLoading.value = false;
  }
};

const reActivateAccount = async () => {
  activationStatus.value = 'pending';
  const email = authStore.pendingActivationEmail;

  if (email) {
    await userApi.resendActivation({
      email,
    });
    activationStatus.value = 'success';
  } else {
    activationStatus.value = 'error';
    errorMessage.value = t('error.invalid_activation_link');
  }
};

onActivated(() => {
  activateAccount();
});
</script>

<style lang="scss" scoped></style>
