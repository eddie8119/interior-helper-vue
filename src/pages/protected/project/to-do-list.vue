<template>
  <NormalLayout subject="project" title="To-Do" />
</template>

<script setup lang="ts">
import NormalLayout from '@/components/app-layout/NormalLayout.vue';

import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<style scoped></style>
