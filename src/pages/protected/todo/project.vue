<template>
  <div
    v-if="isLoadingProject || isLoadingTasks"
    class="flex h-full w-full items-center justify-center"
  >
    <Loading />
  </div>
  <div v-else class="relative h-full w-full">
    <ProjectHeader
      :local-project="fetchedProject"
      :project-id="projectId"
      :last-update-time="formattedUpdateTime"
      @update:project-title="updateProjectTitle"
      @update:project-type="updateProjectType"
    />

    <KanbanBoard
      :project-id="projectId"
      :construction-container="fetchedProject?.constructionContainer || null"
      :tasks="fetchedTasks"
      @update:construction-container="updateConstructionContainer"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { useRoute } from 'vue-router';

import Loading from '@/components/core/loading/Loading.vue';
import ProjectHeader from '@/components/project/ProjectHeader.vue';
const KanbanBoard = defineAsyncComponent(() => import('@/components/project/KanbanBoard.vue'));
import { useProjectUpdates } from '@/composables/todo/useProjectUpdates';
import { useProject } from '@/composables/useProject';
import { useTasks } from '@/composables/useTasks';
import { useUpdateTime } from '@/composables/useUpdateTime';
import { adjustTimeZone, formatDateTimeToMinutes } from '@/utils/date';

const route = useRoute();
const projectId = route.params.id as string;

// 獲取專案與任務資料
const { isLoadingProject, fetchedProject, updateProject } = useProject(projectId);
const { isLoadingTasks, fetchedTasks } = useTasks(projectId);

// 本地更新時間（用於顯示最後操作時間）
const { lastUpdateTime, updateLastUpdateTime } = useUpdateTime();

// 專案更新操作（標題、類型、工程容器）
const { updateProjectTitle, updateProjectType, updateConstructionContainer } = useProjectUpdates(
  fetchedProject,
  updateProject,
  updateLastUpdateTime
);

// 格式化顯示的最後更新時間
const formattedUpdateTime = computed(() => {
  // 優先顯示本地操作時間
  if (lastUpdateTime.value) {
    return lastUpdateTime.value;
  }
  // 否則顯示伺服器回傳的更新時間
  if (fetchedProject.value?.updatedAt) {
    // ProjectResponse.updatedAt 是 Date 類型，需轉為 string
    const updatedAtStr =
      fetchedProject.value.updatedAt instanceof Date
        ? fetchedProject.value.updatedAt.toISOString()
        : String(fetchedProject.value.updatedAt);
    return formatDateTimeToMinutes(adjustTimeZone(updatedAtStr));
  }
  return '';
});
</script>

<style scoped></style>
