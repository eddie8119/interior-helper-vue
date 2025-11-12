<template>
  <div class="panel-container p-8">
    <div ref="scrollContainer" class="relative space-y-8">
      <!-- Submit Button -->
      <TextButton
        variant="primary"
        size="md"
        :class="[
          'z-50 h-10 px-6 sm:w-auto',
          isScrolledDown ? 'absolute bottom-0 right-0 shadow-lg' : 'absolute right-0 top-0',
        ]"
        :loading="isSubmitting"
        :disabled="isSubmitting || !construction.length || !unit.length"
        @click="onSubmit"
      >
        {{ t('common.save') }}
      </TextButton>

      <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
        <!-- Construction Input -->
        <div>
          <DraggableArrayInput
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
          <DraggableArrayInput
            v-model="localUnitItems"
            :title="t('setting.unit')"
            :new-item-factory="() => ({ name: '' })"
            :name-placeholder="t('placeholder.project.add_unit')"
            :add-button-text="t('common.add')"
          />
          <span v-if="unitError" class="mt-1 text-sm text-secondary-red">{{ unitError }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod';
import { ElMessage } from 'element-plus';
import { useField, useForm } from 'vee-validate';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import type { Item } from '@/components/core/input/DraggableArrayInput.vue';
import type { ConstructionSelection } from '@/types/selection';

import TextButton from '@/components/core/button/TextButton.vue';
import DraggableArrayInput from '@/components/core/input/DraggableArrayInput.vue';
import { useCommon } from '@/composables/useCommon';
import { createCommonSchema } from '@/utils/schemas/createCommonSchema';
import {
  addScrollListener,
  getScrollTop,
  removeScrollListener,
  resolveScrollTarget,
  type ScrollTarget,
} from '@/utils/scroll';

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

// Scroll state for save button position
const isScrolledDown = ref(false);
const scrollContainer = ref<HTMLElement | null>(null); // local container ref
let scrollTarget: ScrollTarget | null = null; // resolved actual scroll target

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

// Track scroll position to toggle button position
const handleScroll = () => {
  if (!scrollTarget) return;
  isScrolledDown.value = getScrollTop(scrollTarget) > 20;
};

onMounted(() => {
  // Resolve actual scroll target: nearest scrollable ancestor -> main -> window
  scrollTarget = resolveScrollTarget(scrollContainer.value, 'main');
  addScrollListener(scrollTarget, handleScroll, { passive: true });
  handleScroll();
});

onBeforeUnmount(() => {
  if (scrollTarget) removeScrollListener(scrollTarget, handleScroll);
  scrollTarget = null;
});

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
