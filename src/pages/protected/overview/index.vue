<template>
  <div class="flex h-[calc(100vh-108px)] flex-col">
    <!-- 頂部區域 -->
    <div class="mb-2 flex items-center">
      <H1Title :title="t('title.overview')" />
      <p class="ml-2 flex-nowrap text-gray-500">SITE_12</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<style scoped></style>
