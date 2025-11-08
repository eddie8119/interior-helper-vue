<template>
  <div class="flex h-full w-full flex-col items-center justify-center">
    <div class="spinner-circle" />
    <p class="loading-text text-blue-500">{{ t('common.loading') }}...</p>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<style scoped>
.spinner-circle {
  @apply border-[5px] border-blue-500;
  width: 48px;
  height: 48px;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  margin-top: 16px;
  font-size: 1.2rem;
  font-weight: bold;
  letter-spacing: 1px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
