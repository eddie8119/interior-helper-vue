<template>
  <AuthCard
    :error-message="errorMessage"
    :loading="isSubmitting"
    :is-invalid="!isValid"
    @submit="onSubmit"
  >
    <template #title> Welcome to HSWE IoT! </template>
    <template #button-text> {{ t('button.login') }} </template>
    <LoginForm
      :email="email"
      :password="password"
      :errors="errors"
      @update:email="email = $event"
      @update:password="password = $event"
      @blur:email="handleBlurEmail"
      @blur:password="handleBlurPassword"
    />
  </AuthCard>
</template>

<script setup lang="ts">
import { useField } from 'vee-validate';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import type { LoginData } from '@/types/user';
import type { AxiosError } from 'axios';

import { authApi } from '@/api/auth';
import AuthCard from '@/components/auth/AuthCard.vue';
import LoginForm from '@/components/auth/LoginForm.vue';
import { useFormError } from '@/composables/useFormError';
import { useFormValidation } from '@/composables/useFormValidation';
import { useAuthStore } from '@/stores/auth';
import { setAccessToken, setRefreshToken } from '@/utils/auth';
import { loginSchema } from '@/utils/schemas/loginSchema';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const { handleSubmit, errors, isSubmitting } = useFormValidation<LoginData>(loginSchema, {
  email: '',
  password: '',
});

const { value: email, handleBlur: handleBlurEmail } = useField<string>('email');
const { value: password, handleBlur: handleBlurPassword } = useField<string>('password');

const isValid = computed(() => {
  return email.value && password.value && Object.keys(errors.value).length === 0;
});

const { errorMessage, handleError } = useFormError({
  statusCodes: [401],
  defaultErrorKey: t('error.login_failed'),
});

const onSubmit = handleSubmit(async (values) => {
  try {
    const { data: apiResponseData, success } = await authApi.login(values as LoginData);

    if (success && apiResponseData) {
      const { access_token, refresh_token } = apiResponseData;
      setRefreshToken(refresh_token);
      setAccessToken(access_token);

      // 立即標記為已登入，避免導航守衛因未認證而攔截
      authStore.setAuth(true);

      const redirectParam = route.query.redirect;
      const redirectTo =
        typeof redirectParam === 'string' && redirectParam.length > 0 ? redirectParam : '/overview';

      await router.replace(redirectTo);
    }
  } catch (error) {
    handleError(error as AxiosError);
    authStore.resetAuthState();
  }
});
</script>
