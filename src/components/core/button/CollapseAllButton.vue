<template>
  <button
    type="button"
    class="rounded-md bg-gray-200 px-2 py-1 text-xs text-gray-700 transition-colors hover:bg-gray-300"
    v-bind="$attrs"
  >
    {{ allCollapsed ? t('button.fold.expand_all') : t('button.fold.collapse_all') }}
    <slot>{{ t('label.task.task') }}</slot>
  </button>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineProps<{
  allCollapsed: boolean;
}>();

const { t } = useI18n();
</script>
