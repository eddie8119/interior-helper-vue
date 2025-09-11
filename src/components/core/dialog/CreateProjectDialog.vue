<template>
  <BasicEditDialog
    v-model="dialogVisible"
    :title="t('title.create_project')"
    :is-submitting="isSubmitting"
    @submit="onSubmit"
    @cancel="onCancel"
  >
    <el-form-item :label="t('label.project.project_name')" :error="errors.title">
      <el-input
        v-model="title"
        :placeholder="t('placeholder.project.project_name')"
        @blur="handleBlurTitle"
      />
    </el-form-item>
    <el-form-item :label="t('label.project.project_type')" :error="errors.type">
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
    <el-form-item :label="t('label.project.construction')" :error="errors.constructionContainer">
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
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

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
const { value: constructionContainer, handleBlur: handleBlurConstructionContainer } =
  useField('constructionContainer');

const onSubmit = handleSubmit((values: CreateProjectSchema) => {
  try {
    console.log(555, values);
    // emit('update:projectData', values);

    onCancel();
  } catch (error) {
    console.error('Failed to update device tag:', error);
  }
});

const onCancel = () => {
  emit('update:modelValue', false);
};
</script>
