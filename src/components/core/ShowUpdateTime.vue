<template>
  <p class="absolute right-3 w-full text-right text-sm text-primary-text-200">
    {{ t('common.last_update_time') }}: {{ formattedTime }}
  </p>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps<{ lastUpdateTime: Date | null | number }>();
const { t } = useI18n();
const formatTime = (value: Date | number | null): string => {
  if (!value) return '-';

  const date = new Date(value);
  return date.toLocaleString();
};

const formattedTime = computed(() => formatTime(props.lastUpdateTime));
</script>
