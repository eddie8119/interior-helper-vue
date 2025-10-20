<template>
  <div class="mx-auto max-w-md">
    <AuthCard
      :error-message="errorMessage"
      :loading="isSubmitting"
      :show-logo="false"
      @submit="onSubmit"
    >
      <template #button-text> {{ t('button.change_password') }} </template>
      <ChangePasswordForm
        :old-password="oldPassword"
        :new-password="newPassword"
        :new-confirm-password="newConfirmPassword"
        :errors="errors"
        @update:old-password="oldPassword = $event"
        @update:new-password="newPassword = $event"
        @update:new-confirm-password="newConfirmPassword = $event"
        @blur:old-password="handleBlurOldPassword"
        @blur:new-password="handleBlurNewPassword"
        @blur:new-confirm-password="handleBlurNewConfirmPassword"
      />
    </AuthCard>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { ElMessage } from 'element-plus';
import { useField, useForm } from 'vee-validate';
import { useI18n } from 'vue-i18n';

import type { AxiosError } from 'axios';

import AuthCard from '@/components/auth/AuthCard.vue';
import ChangePasswordForm from '@/components/auth/ChangePasswordForm.vue';
import { useFormError } from '@/composables/useFormError';
import { useUser } from '@/composables/useUser';
import { type ChangePasswordData } from '@/types/user';
import { createChangePasswordSchema } from '@/utils/schemas/changePasswordSchema';

const { t } = useI18n();

const { handleSubmit, errors, isSubmitting, resetForm } = useForm<ChangePasswordData>({
  validationSchema: toTypedSchema(createChangePasswordSchema(t)),
  initialValues: {
    oldPassword: '',
    newPassword: '',
    newConfirmPassword: '',
  },
});

const { errorMessage, handleError } = useFormError({
  statusCodes: [400],
  defaultErrorKey: t('error.change_password_failed'),
});

const { changePassword } = useUser();

const { value: oldPassword, handleBlur: handleBlurOldPassword } = useField<string>('oldPassword');
const { value: newPassword, handleBlur: handleBlurNewPassword } = useField<string>('newPassword');
const { value: newConfirmPassword, handleBlur: handleBlurNewConfirmPassword } =
  useField<string>('newConfirmPassword');

const onSubmit = handleSubmit(async (values: ChangePasswordData) => {
  try {
    const { success, message } = await changePassword(values);

    if (success) {
      ElMessage.success(t('message.change_password_success'));
      resetForm();
    } else {
      errorMessage.value = message || t('error.change_password_failed');
    }
  } catch (error) {
    handleError(error as AxiosError);
  }
});
</script>
