<template>
    <div class="panel-container">
      <H2Title :title="t('setting.construction')" />
      <form
        class="flex flex-col gap-6 lg:flex-row lg:items-end"
        @submit.prevent=""
      >
        <div class="flex w-full flex-col lg:w-auto">
          <label class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
            {{ t('label.construction') }}
          </label>

          <div class="flex flex-wrap gap-2">
          <span
            v-for="item in localConstructionItems"
            :key="item"
            class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
          >
            {{ item }}
            <button
              
              class="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
            >
              <span class="sr-only">Remove</span>
              <svg class="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </span>
        </div>
          
          <div class="h-[38px]">
            <!-- <FormInput
              :model-value="email"
              name="email"
              type="email"
              placeholder="Email"
              :error="errors.email"
              icon="Message"
              class="h-full w-full lg:w-[280px]"
              @update:model-value="(val) => (email = val)"
              @blur="handleBlurEmail"
            /> -->
          </div>
        </div>
  

  
        <div class="flex w-full items-end lg:w-auto">
          <TextButton
            type="submit"
            :loading="isSubmitting"
            variant="primary"
            size="md"
            class="h-[40px] w-full px-8 lg:w-auto"
          >
            {{ t('setting.invite') }}
          </TextButton>
        </div>
      </form>
    </div>
  </template>
  
  <script setup lang="ts">
  import { useI18n } from 'vue-i18n';
  
  import FormInput from '../core/input/FormInput.vue';
  
  import TextButton from '@/components/core/button/TextButton.vue';
  import H2Title from '@/components/core/title/H2Title.vue';
  import { createProjectSchema, type CreateProjectSchema } from '@/utils/schemas/createProjectSchema';

  const { t } = useI18n();
  
  const props = defineProps<{
    newConstructionItem: string;
    localConstructionItems: string[];
  }>();
  
  const emit = defineEmits<{

  }>();
  

  </script>
  
  <style lang="scss" scoped></style>
  