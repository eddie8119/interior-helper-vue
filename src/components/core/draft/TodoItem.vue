<template>
  <div
    class="group mb-2 rounded-lg border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:border-blue-100 hover:shadow-md"
    :class="{ 'bg-blue-50': todoItem.completed }"
  >
    <label class="flex w-full cursor-pointer items-center">
      <div class="relative mr-3 flex h-6 w-6 flex-shrink-0 items-center justify-center">
        <input
          type="checkbox"
          class="peer sr-only"
          :checked="todoItem.completed"
          @change="$emit('change-state', $event)"
        />
        <div
          class="h-6 w-6 rounded-md border-2 border-gray-300 bg-white transition-colors peer-checked:border-blue-500 peer-checked:bg-blue-500 peer-focus:ring-2 peer-focus:ring-blue-200"
        />
        <svg
          class="absolute h-3.5 w-3.5 text-white opacity-0 transition-opacity peer-checked:opacity-100"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          stroke="currentColor"
          stroke-width="1"
        >
          <path
            fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clip-rule="evenodd"
          />
        </svg>
      </div>
      <span
        class="flex-1 text-gray-700 transition-all"
        :class="{ 'text-gray-400 line-through': todoItem.completed }"
      >
        {{ todoItem.content }}
      </span>

      <TextButton
        variant="ghost"
        size="sm"
        class="h-[30px] w-full max-w-[60px] lg:w-auto"
        @click="showMoveToProjectDialog = true"
      >
        {{ t('common.move_to_project') }}
      </TextButton>
    </label>
  </div>

  <MoveDialog v-model="showMoveToProjectDialog" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { TodoItemDraft } from '@/stores/quickDraft';

import TextButton from '@/components/core/button/TextButton.vue';
import MoveDialog from '@/components/core/dialog/MoveDialog.vue';

const { t } = useI18n();

defineProps({
  todoItem: {
    type: Object as () => TodoItemDraft,
    required: true,
  },
});

defineEmits(['change-state']);

const showMoveToProjectDialog = ref(false);
</script>
