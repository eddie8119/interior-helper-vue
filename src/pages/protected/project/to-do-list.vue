<template>
  <TextButton
    variant="primary"
    size="md"
    class="h-[30px] w-full max-w-[60px] lg:w-auto"
    @click="showCreateProjectDialog = true"
  >
    {{ t('common.create') }}
  </TextButton>

  <!-- 建立專案對話框 -->
  <CreateProjectDialog v-model="showCreateProjectDialog" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import TextButton from '@/components/core/button/TextButton.vue';
import CreateProjectDialog from '@/components/core/dialog/CreateProjectDialog.vue';

const { t } = useI18n();

const showCreateProjectDialog = ref(false);
</script>

<style scoped></style>
