<template>
  <div class="panel-container">
    <H2Title :title="t('setting.construction')" />

    <div class="flex w-full flex-col lg:w-auto">
      <Label :label="t('label.setting.existing_list')" />

      <div class="flex flex-wrap gap-2">
        <span
          v-for="item in localConstructionItems"
          :key="item"
          class="inline-flex items-center rounded-full bg-blue-100 px-3 py-1.5 text-sm font-medium"
        >
          {{ item }}
          <DeleteButton @click="handleDeleteConstruction(item)" />
        </span>
      </div>
    </div>

    <!-- Add New -->
    <div class="mt-6">
      <Label :label="t('placeholder.project.add_new_construction')" />
      <div class="flex flex-col gap-4 sm:flex-row sm:items-end">
        <el-form-item
          :error="inputValueError"
          class="mb-0"
          :class="{ 'has-error': inputValueError }"
        >
          <el-input
            v-model="inputValue"
            :placeholder="t('placeholder.project.add_new_construction')"
            size="small"
            class="w-[250px]"
            @blur="handleBlurInputValue"
            @keyup.enter="onSubmit"
          />
        </el-form-item>
        <div class="shrink-0">
          <TextButton
            type="submit"
            :loading="isSubmitting"
            variant="primary"
            size="sm"
            class="h-10 w-full px-6 sm:w-auto"
            :disabled="isSubmitting || !inputValue.trim()"
            @click="onSubmit"
          >
            {{ t('common.add') }}
          </TextButton>
        </div>
      </div>
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
import DeleteButton from '@/components/ui/DeleteButton.vue';
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
