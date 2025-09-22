<template>
  <div class="panel-container">
    <H2Title :title="t('setting.construction')" />

    <div class="flex w-full flex-col lg:w-auto">
      <Label :label="t('label.setting.list')" />

      <div class="flex flex-wrap gap-2">
        <span
          v-for="item in localConstructionItems"
          :key="item"
          class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1.5 text-sm font-medium"
        >
          {{ item }}
          <button
            class="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full hover:bg-blue-200"
            @click="handleDeleteConstruction(item)"
          >
            <span class="sr-only">Remove</span>
            <svg class="h-2.5 w-2.5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </span>
      </div>
    </div>

    <!-- Add New Construction -->
    <div class="mt-6 flex gap-2">
      <el-form-item
        :label="t('placeholder.project.add_new_construction')"
        :error="inputValueError"
        class="mb-0"
      >
        <el-input
          v-model="inputValue"
          :placeholder="t('placeholder.project.add_new_construction')"
          size="small"
          class="w-52"
          @blur="handleBlurInputValue"
          @keyup.enter="onSubmit"
        />
      </el-form-item>
      <TextButton
        type="submit"
        :loading="isSubmitting"
        variant="primary"
        size="sm"
        class="h-[40px] px-8 lg:w-auto"
        :disabled="isSubmitting || !inputValue.trim()"
        @click="onSubmit"
      >
        {{ t('common.add') }}
      </TextButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { useField, useForm } from 'vee-validate';
import { useI18n } from 'vue-i18n';

import TextButton from '@/components/core/button/TextButton.vue';
import H2Title from '@/components/core/title/H2Title.vue';
import Label from '@/components/core/title/Label.vue';
import { inputStringSchema } from '@/utils/schemas/inputStringSchema';

const { t } = useI18n();

defineProps<{
  localConstructionItems: string[];
}>();

const emit = defineEmits<{
  'delete-construction': [index: string];
  'add-construction': [newItem: string];
}>();

const { handleSubmit, isSubmitting, resetForm } = useForm({
  validationSchema: toTypedSchema(inputStringSchema),
  initialValues: { inputValue: '' },
});

const {
  value: inputValue,
  handleBlur: handleBlurInputValue,
  errorMessage: inputValueError,
} = useField('inputValue');

const onSubmit = handleSubmit(async (values: { inputValue: string }) => {
  const value = values.inputValue.trim();
  emit('add-construction', value);

  resetForm();
});

const handleDeleteConstruction = (index: string) => {
  emit('delete-construction', index);
};
</script>

<style lang="scss" scoped></style>
