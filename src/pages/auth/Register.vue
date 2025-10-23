<template>
  <AuthCard
    :error-message="errorMessage"
    :message="showMessage"
    :loading="isSubmitting"
    :is-invalid="!isValid"
    @submit="onSubmit"
  >
    <template #title> {{ t('title.register') }} HSWE IoT! </template>
    <template #button-text> {{ t('button.register') }} </template>
    <RegisterForm
      :name="name"
      :email="email"
      :password="password"
      :confirm-password="confirmPassword"
      :errors="errors"
      @update:name="name = $event"
      @update:email="email = $event"
      @update:password="password = $event"
      @update:confirm-password="confirmPassword = $event"
      @blur:name="handleBlurName"
      @blur:email="handleBlurEmail"
      @blur:password="handleBlurPassword"
      @blur:confirm-password="handleBlurConfirmPassword"
    />
  </AuthCard>
</template>

<script setup lang="ts">
import { useField } from 'vee-validate';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { RegisterData } from '@/types/user';

import AuthCard from '@/components/auth/AuthCard.vue';
import RegisterForm from '@/components/auth/RegisterForm.vue';
import { useFormError } from '@/composables/useFormError';
import { useFormValidation } from '@/composables/useFormValidation';
import { useUser } from '@/composables/useUser';
import router from '@/router';
import { useAuthStore } from '@/stores/auth';
import { createRegisterSchema } from '@/utils/schemas/registerSchema';

const { t } = useI18n();
const authStore = useAuthStore();

const showMessage = ref<string | undefined>(undefined);

const { handleSubmit, errors, isSubmitting } = useFormValidation<RegisterData>(
  createRegisterSchema(t),
  {
    name: '',
    email: '',
    password: '',
  }
);

const { value: name, handleBlur: handleBlurName } = useField<string>('name');
const { value: email, handleBlur: handleBlurEmail } = useField<string>('email');
const { value: password, handleBlur: handleBlurPassword } = useField<string>('password');
const { value: confirmPassword, handleBlur: handleBlurConfirmPassword } =
  useField<string>('confirmPassword');

const isValid = computed(() => {
  return (
    name.value &&
    email.value &&
    password.value &&
    confirmPassword.value &&
    Object.keys(errors.value).length === 0
  );
});

const { errorMessage, handleError } = useFormError({
  statusCodes: [400],
  defaultErrorKey: t('error.register_failed'),
});

const { register } = useUser();

const onSubmit = handleSubmit(async (values: RegisterData) => {
  if (password.value !== confirmPassword.value) return;

  try {
    const { success, message } = await register(values);
    if (!success) {
      showMessage.value = message;
      return;
    }
    if (success) {
      showMessage.value = t('message.dialog.check_the_email');
      authStore.setPendingActivationEmail(email.value);

      // 註冊成功，導向激活頁面
      setTimeout(() => {
        router.push({
          name: 'activation',
          query: {
            email: email.value,
          },
        });
      }, 2000);
    }
  } catch (error) {
    handleError(error as any);
  }
});
</script>
