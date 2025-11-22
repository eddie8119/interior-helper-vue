<template>
  <TextButton
    variant="primary"
    size="md"
    class="mb-4 h-[30px] w-full px-6 md:w-auto"
    @click="showCreateProjectDialog = true"
  >
    {{ t('button.create_project') }}
  </TextButton>

  <!-- 建立專案對話框 -->
  <CreateProjectDialog v-model="showCreateProjectDialog" />

  <ProjectsSection />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import TextButton from '@/components/core/button/TextButton.vue';
import CreateProjectDialog from '@/components/core/dialog/CreateProjectDialog.vue';
import ProjectsSection from '@/components/projects/ProjectsSection.vue';

const { t } = useI18n();

const showCreateProjectDialog = ref(false);
</script>

<style scoped></style>
