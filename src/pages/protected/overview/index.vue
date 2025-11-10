<template>
  <div class="flex flex-col md:h-[calc(100vh-108px)]">
    <!-- 頂部區域 -->
    <div class="mb-2 flex items-center">
      <H1Title :title="t('title.overview_remaining') + t('label.task.task')" />
    </div>
    <!-- Content Section -->
    <section class="flex-1 overflow-y-auto p-4">
      <OverviewSection />
    </section>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import H1Title from '@/components/core/title/H1Title.vue';
import OverviewSection from '@/components/overview/OverviewSection.vue';

const { t } = useI18n();
</script>

<style scoped></style>
