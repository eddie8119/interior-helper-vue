<template></template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import type { ProjectResponse } from '@/types/response';

defineProps<{
  projects: ProjectResponse[] | undefined;
}>();

const { t } = useI18n();
</script>

<style scoped></style>
