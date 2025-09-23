<template>
  <div class="panel-container">
    <h2 class="mb-6 text-xl font-bold">{{ t('setting.common_settings') }}</h2>
    <form class="space-y-8" @submit.prevent="onSubmit">
      <!-- Construction Input -->
      <div class="space-y-2">
        <div class="flex justify-between">
          <Label :label="t('setting.construction')" />
          <span v-if="constructionError" class="text-sm text-red-500">{{ constructionError }}</span>
        </div>

        <div class="mb-2 flex flex-wrap gap-2">
          <div
            v-for="(item, index) in construction"
            :key="index"
            class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1.5 text-sm font-medium"
          >
            {{ item }}
            <button
              type="button"
              class="ml-1 text-blue-400 hover:text-blue-600"
              @click="removeItem('construction', index)"
            >
              <span class="sr-only">Remove</span>
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="flex gap-2">
          <el-input
            v-model="newConstructionItem"
            :placeholder="t('placeholder.project.add_construction')"
            size="small"
            class="w-[250px]"
            @keyup.enter.prevent="addItem('construction')"
          />
          <TextButton
            type="button"
            variant="primary"
            size="sm"
            class="h-10 px-6 sm:w-auto"
            :disabled="!newConstructionItem.trim()"
            @click="addItem('construction')"
          >
            {{ t('common.add') }}
          </TextButton>
        </div>
      </div>

      <!-- Unit Input -->
      <div class="space-y-2">
        <div class="flex justify-between">
          <Label :label="t('setting.unit')" />
          <span v-if="unitError" class="text-sm text-red-500">{{ unitError }}</span>
        </div>

        <div class="mb-2 flex flex-wrap gap-2">
          <div
            v-for="(item, index) in unit"
            :key="index"
            class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1.5 text-sm font-medium"
          >
            {{ item }}
            <button
              type="button"
              class="ml-1 text-blue-400 hover:text-blue-600"
              @click="removeItem('unit', index)"
            >
              <span class="sr-only">Remove</span>
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="flex gap-2">
          <el-input
            v-model="newUnitItem"
            :placeholder="t('placeholder.project.add_unit')"
            size="small"
            class="w-[250px]"
            @keyup.enter.prevent="addItem('unit')"
          />
          <TextButton
            type="button"
            variant="primary"
            size="sm"
            class="h-10 px-6 sm:w-auto"
            :disabled="!newUnitItem.trim()"
            @click="addItem('unit')"
          >
            {{ t('common.add') }}
          </TextButton>
        </div>
      </div>

      <!-- Project Type Input -->
      <div class="space-y-2">
        <div class="flex justify-between">
          <Label :label="t('setting.projectType')" />
          <span v-if="projectTypeError" class="text-sm text-red-500">{{ projectTypeError }}</span>
        </div>

        <div class="mb-2 flex flex-wrap gap-2">
          <div
            v-for="(item, index) in projectType"
            :key="index"
            class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1.5 text-sm font-medium"
          >
            {{ item }}
            <button
              type="button"
              class="ml-1 text-blue-400 hover:text-blue-600"
              @click="removeItem('projectType', index)"
            >
              <span class="sr-only">Remove</span>
              <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"
                />
              </svg>
            </button>
          </div>
        </div>

        <div class="flex gap-2">
          <el-input
            v-model="newProjectTypeItem"
            :placeholder="t('placeholder.project.add_project_type')"
            size="small"
            class="w-[250px]"
            @keyup.enter.prevent="addItem('projectType')"
          />
          <TextButton
            type="button"
            variant="primary"
            size="sm"
            class="h-10 px-6 sm:w-auto"
            :disabled="!newProjectTypeItem.trim()"
            @click="addItem('projectType')"
          >
            {{ t('common.add') }}
          </TextButton>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end">
        <TextButton
          type="submit"
          variant="primary"
          size="md"
          class="h-10 px-6 sm:w-auto"
          :loading="isSubmitting"
          :disabled="isSubmitting || !construction.length || !unit.length || !projectType.length"
        >
          {{ t('common.save') }}
        </TextButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { ElMessage } from 'element-plus';
import { useField, useForm } from 'vee-validate';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import TextButton from '@/components/core/button/TextButton.vue';
import Label from '@/components/core/title/Label.vue';
import { useCommon } from '@/composables/useCommon';
import { createCommonSchema, type CreateCommonSchema } from '@/utils/schemas/createCommonSchema';

const { t } = useI18n();
const { common, updateCommon } = useCommon();

// Form validation setup
const { handleSubmit, isSubmitting } = useForm({
  validationSchema: toTypedSchema(createCommonSchema),
  initialValues: { construction: [], unit: [], projectType: [] },
});

// Form fields
const {
  value: construction,
  handleBlur: handleBlurConstruction,
  errorMessage: constructionError,
} = useField<string[]>('construction');
const {
  value: unit,
  handleBlur: handleBlurUnit,
  errorMessage: unitError,
} = useField<string[]>('unit');
const {
  value: projectType,
  handleBlur: handleBlurProjectType,
  errorMessage: projectTypeError,
} = useField<string[]>('projectType');

// New item inputs
const newConstructionItem = ref('');
const newUnitItem = ref('');
const newProjectTypeItem = ref('');

// Add item to a specific field
const addItem = (field: 'construction' | 'unit' | 'projectType') => {
  const fieldMap = {
    construction: { value: construction, newItem: newConstructionItem },
    unit: { value: unit, newItem: newUnitItem },
    projectType: { value: projectType, newItem: newProjectTypeItem },
  };

  const { value, newItem } = fieldMap[field];
  const trimmedValue = newItem.value.trim();

  if (!trimmedValue) return;
  if (value.value.includes(trimmedValue)) {
    ElMessage.warning(t('message.item_already_exists'));
    return;
  }

  value.value = [...value.value, trimmedValue];
  newItem.value = '';
};

// Remove item from a specific field
const removeItem = (field: 'construction' | 'unit' | 'projectType', index: number) => {
  const fieldMap = {
    construction,
    unit,
    projectType,
  };

  const fieldValue = fieldMap[field];
  fieldValue.value = fieldValue.value.filter((_, i) => i !== index);
};

// Form submission handler
const onSubmit = handleSubmit(async (values: CreateCommonSchema) => {
  try {
    if (!common.value || common.value.length === 0) {
      // Create new common data if none exists
      // This would typically call an API to create a new record
      ElMessage.error(t('message.no_common_data_exists'));
      return;
    }

    const commonId = common.value[0].id;
    await updateCommon({
      id: commonId,
      data: {
        construction: values.construction,
        unit: values.unit,
        projectType: values.projectType,
      },
    });

    ElMessage.success(t('message.update_success'));
  } catch (error) {
    console.error('Failed to update common data:', error);
    ElMessage.error(t('message.update_failed'));
  }
});
</script>

<style scoped>
.panel-container {
  padding: 1.5rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.1),
    0 1px 2px 0 rgba(0, 0, 0, 0.06);
}
</style>
