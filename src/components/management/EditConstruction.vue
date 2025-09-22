<template>
  <div class="panel-container">
    <H2Title :title="t('setting.construction')" />

    <div class="flex w-full flex-col lg:w-auto">
      <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {{ t('label.construction_list') }}
      </label>

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
        :error="newConstructionItemError"
      >
        <el-input
          v-model="newConstructionItem"
          :placeholder="t('placeholder.project.add_new_construction')"
          size="small"
          class="w-52"
          @keyup.enter="handleAddConstruction"
        />
      </el-form-item>
      <TextButton
        type="submit"
        :loading="isSubmitting"
        variant="primary"
        size="sm"
        class="h-[40px] w-full px-8 lg:w-auto"
        :disabled="isSubmitting || !newConstructionItem.trim()"
        @click="handleAddConstruction"
      >
        {{ t('common.add') }}
      </TextButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import TextButton from '@/components/core/button/TextButton.vue';
import H2Title from '@/components/core/title/H2Title.vue';

const { t } = useI18n();

const props = defineProps<{
  localConstructionItems: string[];
}>();

const emit = defineEmits<{
  'delete-construction': [index: string];
  'add-construction': [newItem: string];
}>();

const newConstructionItem = ref<string>('');
const newConstructionItemError = ref<string>('');
const isSubmitting = ref<boolean>(false);

const handleDeleteConstruction = (index: string) => {
  emit('delete-construction', index);
};
const handleAddConstruction = async () => {
  if (isSubmitting.value) return;

  const value = newConstructionItem.value.trim();

  try {
    isSubmitting.value = true;
    emit('add-construction', value);
    newConstructionItem.value = '';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style lang="scss" scoped></style>
