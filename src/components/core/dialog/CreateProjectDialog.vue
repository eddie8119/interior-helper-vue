<template>
  <BasicEditDialog
    v-model="dialogVisible"
    :title="t('title.create_project')"
    :is-submitting="isSubmitting"
    :error-message="errorMessage"
    @submit="onSubmit"
    @cancel="onCancel"
  >
    <el-form-item :label="t('label.project.project_name')" :error="titleError">
      <el-input
        v-model="title"
        :placeholder="t('placeholder.project.project_name')"
        @blur="handleBlurTitle"
      />
    </el-form-item>
    <el-form-item :label="t('label.project.project_type')" :error="typeError">
      <el-select
        v-model="type"
        :placeholder="t('placeholder.project.project_type')"
        @blur="handleBlurType"
      >
        <el-option
          v-for="item in PROJECT_TYPES"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-form-item>
    <el-form-item :label="t('label.project.construction')" :error="constructionContainerError">
      <el-select
        v-model="constructionContainer"
        multiple
        :placeholder="t('placeholder.project.construction')"
        @blur="handleBlurConstructionContainer"
      >
        <el-option
          v-for="item in CONSTRUCTION_CONTAINER"
          :key="item.type"
          :label="item.type"
          :value="item.type"
        />
      </el-select>
    </el-form-item>
  </BasicEditDialog>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useField, useForm } from 'vee-validate';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { projectApi } from '@/api/project';
import BasicEditDialog from '@/components/core/dialog/BasicEditDialog.vue';
import { CONSTRUCTION_CONTAINER, PROJECT_TYPES } from '@/constants/selection';
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

const { value: title, handleBlur: handleBlurTitle, errorMessage: titleError } = useField('title');
const { value: type, handleBlur: handleBlurType, errorMessage: typeError } = useField('type');
const {
  value: constructionContainer,
  handleBlur: handleBlurConstructionContainer,
  errorMessage: constructionContainerError,
} = useField('constructionContainer');

const onSubmit = handleSubmit(async (values: CreateProjectSchema) => {
  try {
    const { success, message } = await projectApi.createProject(values);
    if (!success) {
      errorMessage.value = message ?? '';
      return;
    }
    if (success) onCancel();
  } catch (error) {
    console.error('Failed to update device tag:', error);
  }
});

const onCancel = () => {
  emit('update:modelValue', false);
};
</script>
