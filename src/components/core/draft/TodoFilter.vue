<template>
  <div class="mb-4 flex flex-wrap items-center justify-between">
    <div class="background-color-difference flex space-x-1 rounded-lg p-1">
      <button
        v-for="filter in TODO_FILTER"
        :key="filter.value"
        class="rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200"
        :class="[
          selected === filter.value
            ? 'panel-color-difference text-blue-600 shadow'
            : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700',
        ]"
        @click="$emit('change-filter', filter.value)"
      >
        {{ t(`option.status.${filter.value}`) }}
      </button>
    </div>

    <button
      class="mt-2 flex items-center rounded-md px-3 py-1 text-sm font-medium text-secondary-red hover:bg-red-50 hover:text-secondary-red sm:mt-0"
      @click="$emit('clear-done')"
    >
      <TrashButton />
      {{ t('button.delete_completed') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import TrashButton from '@/components/ui/TrashButton.vue';
import { TODO_FILTER } from '@/constants/selection';

defineProps({
  selected: {
    type: String,
    required: true,
  },
});

defineEmits(['change-filter', 'clear-done']);
const { t } = useI18n();
</script>
