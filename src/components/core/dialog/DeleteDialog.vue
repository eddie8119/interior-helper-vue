<template>
  <BasicEditDialog
    v-model="dialogVisible"
    :title="t('title.delete_confirm')"
    :is-submitting="isSubmitting"
    :error-message="errorMessage"
    @submit="onSubmit"
    @cancel="onCancel"
  >
  </BasicEditDialog>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useField, useForm } from 'vee-validate';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import BasicEditDialog from '@/components/core/dialog/BasicEditDialog.vue';
import { createProjectSchema, type CreateProjectSchema } from '@/utils/schemas/createProjectSchema';

const { t } = useI18n();

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'update:projectData': [projectData: CreateProjectSchema];
}>();

const errorMessage = ref<string>('');

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const { handleSubmit, errors, isSubmitting } = useForm({
  validationSchema: toTypedSchema(createProjectSchema),
  initialValues: { title: '', type: 'residential', constructionContainer: [] },
});

const onSubmit = handleSubmit(async (values: CreateProjectSchema) => {
  try {
    //   const { success, message } = await projectApi.createProject(values);
    //   if (!success) {
    //     errorMessage.value = message ?? '';
    //     return;
    //   }
    //   if (success) onCancel();
  } catch (error) {
    console.error('Failed to update device tag:', error);
  }
});

const onCancel = () => {
  emit('update:modelValue', false);
};
</script>
