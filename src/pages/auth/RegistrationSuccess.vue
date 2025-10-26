<template>
  <AuthCard
    :error-message="resendErrorMessage"
    :message="resendMessage"
    :loading="isResending"
    :show-submit-button="false"
  >
    <template #title>{{ t('title.register_success') }}</template>

    <div class="flex flex-col items-center">
      <img :src="check" alt="check" class="mb-6 h-16 w-16" />

      <p class="mb-2 text-center text-lg font-semibold">
        {{ t('message.dialog.check_email_for_activation') }}
      </p>

      <p class="mb-6 text-center text-sm text-gray-600">
        {{ t('message.dialog.check_the_email') }}
        <span class="font-medium">{{ email }}</span>
      </p>

      <ElButton
        type="primary"
        size="large"
        :loading="isResending"
        block
        class="auth-brand-button w-full"
        @click="handleResendEmail"
      >
        {{ t('button.resend_activation_email') }}
      </ElButton>
    </div>
  </AuthCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import check from '@/assets/images/check.png';
import AuthCard from '@/components/auth/AuthCard.vue';
import { useUser } from '@/composables/useUser';

const { t } = useI18n();
const route = useRoute();
const { resendActivation, isResending, resendError } = useUser();

const resendMessage = ref<string | null>(null);
const email = ref<string | undefined>(route.query.email as string | undefined);

const resendErrorMessage = computed(() => resendError.value?.message ?? null);

const handleResendEmail = async () => {
  resendMessage.value = null;
  resendError.value = null;

  if (!email.value) {
    resendError.value = new Error(t('error.invalid_email'));
    return;
  }

  try {
    const { success, message } = await resendActivation({ email: email.value });

    if (success) {
      resendMessage.value = t('message.dialog.check_the_email');
    } else {
      resendError.value = new Error(message || t('error.resend_activation_failed'));
    }
  } catch (error: any) {
    if (error?.response?.data?.message) {
      resendError.value = new Error(error.response.data.message);
    } else {
      resendError.value = new Error(t('error.resend_activation_failed'));
    }
  }
};
</script>

<style lang="scss" scoped></style>
