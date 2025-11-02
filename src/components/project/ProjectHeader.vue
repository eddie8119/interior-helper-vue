<template>
  <div class="my-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-6">
    <!-- 更新時間（手機置頂／桌面置右） -->
    <div class="order-1 w-full md:order-3 md:w-auto">
      <ShowUpdateTime :last-update-time="lastUpdateTime" />
    </div>

    <!-- 左側群組：標題 + 類型 -->
    <div
      class="order-2 flex flex-col gap-2 md:order-1 md:flex-1 md:flex-row md:items-center md:gap-4"
    >
      <div class="w-full md:w-auto">
        <ProjectTitle
          :project-title="localProject?.title || undefined"
          @update:project-title="handleUpdateTitle"
        />
      </div>

      <div class="w-full md:w-auto">
        <ProjectTypeComponent
          :project-type="localProject?.type || undefined"
          @update:project-type="handleUpdateType"
        />
      </div>
    </div>

    <!-- 右側群組：設定 -->
    <div class="order-3 flex flex-col items-start gap-2 md:order-2 md:flex-row md:items-center">
      <div class="w-full md:w-auto">
        <ProjectSettings
          :project-title="localProject?.title || undefined"
          :project-id="projectId"
        />
      </div>
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
