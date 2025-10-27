<template>
  <AuthCard
    :error-message="errorMessage"
    :loading="isSubmitting"
    :show-logo="false"
    @submit="onSubmit"
  >
    <template #button-text> {{ t('button.edit_profile') }} </template>
    <EditProfileForm
      :errors="errors"
      :name="name"
      :company="company"
      :phone="phone"
      @update:name="name = $event"
      @update:company="company = $event"
      @update:phone="phone = $event"
      @blur:name="handleBlurName"
      @blur:company="handleBlurCompany"
      @blur:phone="handleBlurPhone"
    />
  </AuthCard>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { ElMessage } from 'element-plus';
import { useField, useForm } from 'vee-validate';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import AuthCard from '@/components/auth/AuthCard.vue';
import EditProfileForm from '@/components/auth/EditProfileForm.vue';
import { useUser } from '@/composables/useUser';
import { type EditProfileData } from '@/types/user';
import { editProfileSchema } from '@/utils/schemas/editProfile';
const errorMessage = ref('');

const { t } = useI18n();
const { userProfile, isLoadingProfile, refetchProfile, updateProfile, isUpdatingProfile } =
  useUser();

const { handleSubmit, errors, isSubmitting, resetForm } = useForm<EditProfileData>({
  validationSchema: toTypedSchema(editProfileSchema),
  initialValues: {
    name: '',
    company: '',
    phone: '',
  },
});

const { value: name, handleBlur: handleBlurName } = useField<string>('name');
const { value: company, handleBlur: handleBlurCompany } = useField<string>('company');
const { value: phone, handleBlur: handleBlurPhone } = useField<string>('phone');

const onSubmit = handleSubmit(async (values: EditProfileData) => {
  try {
    const { success, message } = await updateProfile(values);

    if (success) {
      ElMessage.success(t('message.success.updateProfile'));
    } else {
      ElMessage.error(message || t('message.error.updateProfile'));
      throw new Error(message || 'Failed to update profile');
    }
  } catch (error) {
    ElMessage.error(t('message.error.updateProfile') || 'Failed to update profile');
    throw error;
  }
});
</script>
