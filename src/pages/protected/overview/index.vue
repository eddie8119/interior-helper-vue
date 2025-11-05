<template>
  <div class="flex h-[calc(100vh-108px)] flex-col">
    <!-- 頂部區域 -->
    <div class="mb-2 flex items-center">
      <H1Title :title="t('title.reminder_upcoming_task_in_10_days')" />
    </div>
    <!-- Content Section -->
    <section class="flex-1 overflow-y-auto p-4">
      <OverviewBoard />
    </section>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import H1Title from '@/components/core/title/H1Title.vue';
import OverviewBoard from '@/components/overview/OverviewBoard.vue';

const { t } = useI18n();
</script>

<style scoped></style>
