<template>
  <span class="rounded-full bg-secondary-red px-2 py-0.5 text-xs font-bold text-white">
    {{ t(`label.status.${showIndex}`) }}
  </span>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

defineProps<{ showIndex: string }>();

const { t } = useI18n();
</script>
