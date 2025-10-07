<template>
  <div
    v-if="isLoadingProject && isLoadingTasks"
    class="flex h-full w-full items-center justify-center"
  >
    <Loading />
  </div>
  <div v-else class="relative h-full w-full">
    <div class="mb-2 flex flex-col md:flex-row md:justify-between">
      <ProjectHeader :title="localProject?.title || ''" @update:title="updateProjectTitle" />

      <div class="flex items-center gap-4">
        <ProjectSettings :project-title="localProject?.title || ''" :project-id="projectId" />
        <ShowUpdateTime :last-update-time="formattedUpdateTime" />
      </div>
    </div>

    <KanbanBoard
      :project-id="projectId"
      :construction-container="localProject?.constructionContainer || []"
      :tasks="localTasks"
      @update:construction-container="updateConstructionContainer"
      @update:project-all-tasks="updateProjectAllTasks"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { onBeforeRouteLeave, useRoute } from 'vue-router';

import Loading from '@/components/core/loading/Loading.vue';
import KanbanBoard from '@/components/core/project/KanbanBoard.vue';
import ProjectHeader from '@/components/core/project/ProjectHeader.vue';
import ProjectSettings from '@/components/core/project/ProjectSettings.vue';
import ShowUpdateTime from '@/components/core/ShowUpdateTime.vue';
import { useProjectInitialization } from '@/composables/todo/useProjectInitialization';
import { useProjectLocalStorage } from '@/composables/todo/useProjectLocalStorage';
import { useProjectSaving } from '@/composables/todo/useProjectSaving';
import { useProjectUpdates } from '@/composables/todo/useProjectUpdates';
import { useTaskLocalStorage } from '@/composables/todo/useTaskLocalStorage';
import { useTaskUpdates } from '@/composables/todo/useTaskUpdates';
import { useProject } from '@/composables/useProject';
import { useTasks } from '@/composables/useTasks';
import { useUpdateTime } from '@/composables/useUpdateTime';
import { adjustTimeZone, formatDateTimeWithMinutes } from '@/utils/dateTime';

const route = useRoute();
const projectId = route.params.id as string;

// 獲取專案資料-互動api
const { isLoadingProject, fetchedProject, updateProject } = useProject(projectId);
const { isLoadingTasks, fetchedTasks, updateProjectTasks } = useTasks(projectId);

// 獲取本地專案數據-省api-操作時都先存在本地 最後才送api
const {
  localProject,
  hasChanges: hasProjectChanges,
  initLocalProject,
  saveToLocalStorage: saveProjectToLocalStorage,
} = useProjectLocalStorage(projectId, fetchedProject);
const {
  localTasks,
  hasChanges: hasTasksChanges,
  initLocalTasks,
  saveToLocalStorage: saveTasksToLocalStorage,
} = useTaskLocalStorage(projectId, fetchedTasks);

const { lastUpdateTime, updateLastUpdateTime } = useUpdateTime();

// 專案初始化
useProjectInitialization(
  fetchedProject,
  fetchedTasks,
  localProject,
  localTasks,
  initLocalProject,
  initLocalTasks
);

// 專案更新
const { updateProjectTitle, updateConstructionContainer } = useProjectUpdates(
  localProject,
  saveProjectToLocalStorage,
  updateLastUpdateTime
);
// 更新專案下所有任務
const { updateProjectAllTasks } = useTaskUpdates(
  localTasks,
  saveTasksToLocalStorage,
  updateLastUpdateTime
);

// 專案保存
const { saveAllData } = useProjectSaving(
  projectId,
  localProject,
  localTasks,
  hasProjectChanges,
  hasTasksChanges,
  updateProject,
  updateProjectTasks
);

// 路由離開前保存數據 - 直接調用 saveAllData
onBeforeRouteLeave(async (_, __, next: any) => {
  await saveAllData();
  next();
});

const formattedUpdateTime = computed(() => {
  // 如果有本地更新時間，優先使用本地更新時間
  if (lastUpdateTime.value) {
    return lastUpdateTime.value;
  }
  // 否則使用從服務器獲取的更新時間
  if (localProject.value?.updatedAt) {
    return formatDateTimeWithMinutes(adjustTimeZone(localProject.value.updatedAt));
  }
  return '';
});
</script>

<style scoped></style>
