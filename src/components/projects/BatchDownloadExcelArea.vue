<template>
  <TextButton
    type="button"
    variant="secondary"
    size="sm"
    class="px-2 sm:w-auto"
    @click="showBatchDownloadDialog = true"
    ><span>📥</span>
    {{ t('button.batch_download') }}
  </TextButton>

  <BatchDownloadDialog v-model="showBatchDownloadDialog" :projects="projects" :tasks="tasks" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import type { ProjectResponse, TaskResponse } from '@/types/response';

import TextButton from '@/components/core/button/TextButton.vue';
import BatchDownloadDialog from '@/components/core/dialog/BatchDownloadDialog.vue';

defineProps<{
  projects: ProjectResponse[];
  tasks: TaskResponse[];
}>();

const { t } = useI18n();
const showBatchDownloadDialog = ref(false);
</script>

<style scoped></style>
