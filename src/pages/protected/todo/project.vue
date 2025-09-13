<template>
  <TextButton
    variant="primary"
    size="md"
    class="h-[30px] w-full max-w-[60px] lg:w-auto"
    @click="showCreateProjectDialog = true"
  >
    {{ t('common.create_project') }}
  </TextButton>

  <!-- 建立專案對話框 -->
  <CreateProjectDialog v-model="showCreateProjectDialog" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

import TextButton from '@/components/core/button/TextButton.vue';
import CreateProjectDialog from '@/components/core/dialog/CreateProjectDialog.vue';
import { useProject } from '@/composables/useProject';

const { t } = useI18n();
const route = useRoute();
const projectId = route.params.id as string;

const showCreateProjectDialog = ref(false);
const { isLoadingProject, error, fetchedProject, refetchProject, projectUpdatedAt } =
  useProject(projectId);
</script>

<style scoped></style>
