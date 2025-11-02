<template>
  <NormalLayout :subject="t('title.setting_common')" />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

import NormalLayout from '@/components/app-layout/NormalLayout.vue';

const { t } = useI18n();
</script>

<style scoped></style>
