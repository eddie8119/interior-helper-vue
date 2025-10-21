<template>
  <div class="my-5 flex flex-col gap-4 md:flex-row md:justify-between">
    <div class="flex items-center gap-4">
      <ProjectTitle
        :project-title="localProject?.title || undefined"
        @update:project-title="handleUpdateTitle"
      />
      <ProjectTypeComponent
        :project-type="localProject?.type || undefined"
        @update:project-type="handleUpdateType"
      />
    </div>

    <div class="flex items-center gap-4">
      <ProjectSettings :project-title="localProject?.title || undefined" :project-id="projectId" />
      <ShowUpdateTime :last-update-time="lastUpdateTime" />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProjectResponse } from '@/types/response';
import type { ProjectType as ProjectTypeValue } from '@/types/selection';

import ShowUpdateTime from '@/components/core/ShowUpdateTime.vue';
import ProjectSettings from '@/components/project/ProjectSettings.vue';
import ProjectTitle from '@/components/project/ProjectTitle.vue';
import ProjectTypeComponent from '@/components/project/ProjectType.vue';

defineProps<{
  localProject: ProjectResponse | null;
  projectId: string;
  lastUpdateTime: string | number | Date | null;
}>();

const emit = defineEmits<{
  (e: 'update:project-title', value: string): void;
  (e: 'update:project-type', value: ProjectTypeValue): void;
}>();

const handleUpdateTitle = (value: string) => {
  emit('update:project-title', value);
};

const handleUpdateType = (value: ProjectTypeValue) => {
  emit('update:project-type', value);
};
</script>

<style scoped></style>
