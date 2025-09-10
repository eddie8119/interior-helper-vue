<template>
  <BasicEditDialog
    v-model="dialogVisible"
    :title="t('title.create_project')"
    :is-submitting="isSubmitting"
    @submit="onSubmit"
    @cancel="onCancel"
  >
    <el-form-item :label="t('device.customName')" :error="errors.title">
      <el-input v-model="title" :placeholder="t('device.customName')" @blur="handleBlurTitle" />
    </el-form-item>
    <el-form-item :label="t('device.customName')" :error="errors.type">
      <el-input v-model="type" :placeholder="t('device.customName')" @blur="handleBlurType" />
    </el-form-item>
  </BasicEditDialog>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useField, useForm } from 'vee-validate';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import BasicEditDialog from '@/components/core/dialog/BasicEditDialog.vue';
import { createProjectSchema, CreateProjectSchema } from '@/utils/schemas/createProjectSchema';

const { t } = useI18n();

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'update:projectData': [projectData: CreateProjectSchema];
}>();

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const { handleSubmit, errors, isSubmitting } = useForm({
  validationSchema: toTypedSchema(createProjectSchema),
  initialValues: { title: '', type: 'residential', constructionContainer: [] },
});

const { value: title, handleBlur: handleBlurTitle } = useField('title');
const { value: type, handleBlur: handleBlurType } = useField('type');
const { value: constructionContainer, handleBlur: handleBlurConstructionContainer } = useField('constructionContainer');

const onSubmit = handleSubmit((values) => {
  try {
    emit('update:modelValue', values);

    onCancel();
  } catch (error) {
    console.error('Failed to update device tag:', error);
  }
});

const onCancel = () => {
  emit('update:modelValue', false);
};
</script>
