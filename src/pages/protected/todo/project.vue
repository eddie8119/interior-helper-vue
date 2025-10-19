<template>
  <div
    v-if="isLoadingProject || isLoadingTasks"
    class="flex h-full w-full items-center justify-center"
  >
    <Loading />
  </div>
  <div v-else class="relative h-full w-full">
    <ProjectHeader
      :local-project="localProject || null"
      :project-id="projectId"
      :last-update-time="formattedUpdateTime"
      @update:project-title="updateProjectTitle"
      @update:project-type="updateProjectType"
    />

    <KanbanBoard
      :project-id="projectId"
      :construction-container="localProject?.constructionContainer || null"
      :tasks="localTasks"
      @update:construction-container="updateConstructionContainer"
      @update:project-all-tasks="updateProjectAllTasks"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { onBeforeRouteLeave, useRoute } from 'vue-router';

import Loading from '@/components/core/loading/Loading.vue';
import ProjectHeader from '@/components/project/ProjectHeader.vue';
const KanbanBoard = defineAsyncComponent(() => import('@/components/project/KanbanBoard.vue'));
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
const { updateProjectTitle, updateProjectType, updateConstructionContainer } = useProjectUpdates(
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
  try {
    await saveAllData();
    next();
  } catch (error) {
    console.error('保存專案數據失敗:', error);
    next(false);
  }
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
