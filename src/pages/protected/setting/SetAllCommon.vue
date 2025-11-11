<template>
  <div class="panel-container p-8">
    <div class="space-y-8">
      <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
        <!-- Construction Input -->
        <div>
          <BasicArrayInput
            v-model="localConstructionItems"
            :title="t('setting.construction')"
            :new-item-factory="createNewConstructionItem"
            :name-placeholder="t('placeholder.project.add_construction')"
            :add-button-text="t('common.add')"
          />
          <span v-if="constructionError" class="mt-1 text-sm text-secondary-red">{{
            constructionError
          }}</span>
        </div>

        <!-- Unit Input -->
        <div>
          <BasicArrayInput
            v-model="localUnitItems"
            :title="t('setting.unit')"
            :new-item-factory="() => ({ name: '' })"
            :name-placeholder="t('placeholder.project.add_unit')"
            :add-button-text="t('common.add')"
          />
          <span v-if="unitError" class="mt-1 text-sm text-secondary-red">{{ unitError }}</span>
        </div>
      </div>

      <!-- Submit Button -->
      <div class="flex justify-end">
        <TextButton
          variant="primary"
          size="md"
          class="h-10 px-6 sm:w-auto"
          :loading="isSubmitting"
          :disabled="isSubmitting || !construction.length || !unit.length"
          @click="onSubmit"
        >
          {{ t('common.save') }}
        </TextButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { ElMessage } from 'element-plus';
import { useField, useForm } from 'vee-validate';
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Item } from '@/components/core/input/BasicArrayInput.vue';
import type { ConstructionSelection } from '@/types/selection';

import TextButton from '@/components/core/button/TextButton.vue';
import BasicArrayInput from '@/components/core/input/BasicArrayInput.vue';
import { useCommon } from '@/composables/useCommon';
import { createCommonSchema } from '@/utils/schemas/createCommonSchema';

const { t } = useI18n();
const { fetchedCommon, updateCommon } = useCommon();
// Form validation setup
const { handleSubmit, isSubmitting, setValues } = useForm({
  validationSchema: toTypedSchema(createCommonSchema(t)),
  initialValues: {
    construction: fetchedCommon.value?.construction || [],
    unit: fetchedCommon.value?.unit || [],
  },
});

// Form fields
const { value: construction, errorMessage: constructionError } =
  useField<ConstructionSelection[]>('construction');
const { value: unit, errorMessage: unitError } = useField<string[]>('unit');

// Local copies for array inputs
interface ConstructionItem extends Item {
  id: string;
}
const localConstructionItems = ref<ConstructionItem[]>([]);
const localUnitItems = ref<Item[]>([]);

// Factory function for new construction items
const createNewConstructionItem = () => {
  return { name: '', id: Date.now().toString() } as ConstructionItem;
};

// Sync from form state to local state
const syncToLocal = () => {
  localConstructionItems.value = construction.value.map((item: ConstructionSelection) => ({
    name: item.name,
    id: item.id,
  }));
  localUnitItems.value = unit.value.map((name: string) => ({ name }));
};

// Sync from local state to form state
const syncToForm = () => {
  construction.value = localConstructionItems.value
    .filter((item: ConstructionItem) => item.name)
    .map((item: ConstructionItem) => ({
      name: item.name,
      id: item.id,
    }));
  unit.value = localUnitItems.value.map((item: Item) => item.name).filter(Boolean);
};

// Watch for external changes to common data and update form values
watch(
  fetchedCommon,
  (newCommon) => {
    if (newCommon) {
      setValues({
        construction: newCommon.construction || [],
        unit: newCommon.unit || [],
      });
      syncToLocal(); // Update local state when form state changes
    }
  },
  { immediate: true, deep: true }
);

// Form submission handler
const onSubmit = handleSubmit(async () => {
  syncToForm(); // Sync local changes to form state before submitting
  try {
    if (!fetchedCommon.value) {
      ElMessage.error(t('message.no_common_data_exists'));
      return;
    }

    await updateCommon({
      id: fetchedCommon.value.id,
      data: {
        construction: construction.value,
        unit: unit.value,
      },
    });

    ElMessage.success(t('message.success.update'));
  } catch (error) {
    console.error('Failed to update common data:', error);
    ElMessage.error(t('message.error.update'));
  }
});
</script>

<style scoped></style>
