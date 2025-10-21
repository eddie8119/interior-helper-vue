<template>
  <BasicEditDialog
    v-model="dialogVisible"
    :title="t('title.create_project')"
    :is-submitting="isSubmitting"
    :error-message="errorMessage"
    :is-invalid="isInvalid"
    @submit="onSubmit"
    @cancel="onCancel"
  >
    <ElFormItem :label="t('label.project.project_name')" :error="titleError">
      <ElInput
        v-model="title"
        :placeholder="t('placeholder.project.project_name')"
        @blur="handleBlurTitle"
      />
    </ElFormItem>
    <ElFormItem :label="t('label.project.project_type')" :error="typeError">
      <ElSelect
        v-model="type"
        :placeholder="t('placeholder.project.project_type')"
        @blur="handleBlurType"
      >
        <ElOption
          v-for="item in PROJECT_TYPES"
          :key="item.value"
          :label="t(`project.type.${item.value}`)"
          :value="item.value"
        />
      </ElSelect>
    </ElFormItem>
    <ElFormItem :label="t('label.project.construction')" :error="constructionContainerError">
      <ElSelect
        v-model="constructionContainer"
        multiple
        filterable
        allow-create
        default-first-option
        :reserve-keyword="false"
        :placeholder="t('placeholder.project.construction')"
        value-key="id"
        @blur="handleBlurConstructionContainer"
      >
        <ElOption :value="newConstructionItem" class="flex items-center gap-2">
          <ElInput
            v-model="newConstructionItem"
            :placeholder="t('placeholder.project.add_new_construction')"
            size="small"
            @keyup.enter="addConstructionData"
            @click.stop
          >
            <template #append>
              <ElButton :icon="Plus" size="small" @click.stop="addConstructionData" />
            </template>
          </ElInput>
        </ElOption>
        <ElOption
          v-for="item in localConstructionItems"
          :key="item.id"
          :label="item.name + '工程'"
          :value="item"
        />
      </ElSelect>
    </ElFormItem>
  </BasicEditDialog>
</template>

<script setup lang="ts">
import { Plus } from '@element-plus/icons-vue';
import { useQueryClient } from '@tanstack/vue-query';
import { toTypedSchema } from '@vee-validate/zod';
import { useField, useForm } from 'vee-validate';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { projectApi } from '@/api/project';
import BasicEditDialog from '@/components/core/dialog/BasicEditDialog.vue';
import { useCommonAction } from '@/composables/useCommonAction';
import { PROJECT_TYPES } from '@/constants/selection';
import { createProjectSchema, type CreateProjectSchema } from '@/utils/schemas/createProjectSchema';

const props = defineProps<{
  modelValue: boolean;
}>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'update:projectData': [projectData: CreateProjectSchema];
}>();
const { t } = useI18n();
const queryClient = useQueryClient();
const { newConstructionItem, localConstructionItems, addConstructionData } = useCommonAction();

const errorMessage = ref<string>('');

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const getInitialValues = (): CreateProjectSchema => ({
  title: '',
  type: 'residential',
  constructionContainer: [],
});

const { handleSubmit, isSubmitting, meta, resetForm } = useForm({
  validationSchema: toTypedSchema(createProjectSchema),
  initialValues: getInitialValues(),
});

const isInvalid = computed(() => !meta.value.valid);

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
    if (success) {
      await queryClient.invalidateQueries({ queryKey: ['overview-projects'] });
      onCancel();
    }
  } catch (error) {
    console.error('Failed to update device tag:', error);
  } finally {
    resetForm({ values: getInitialValues() });
  }
});

const onCancel = () => {
  emit('update:modelValue', false);
};
</script>
