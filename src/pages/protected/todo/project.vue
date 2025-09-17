<template>
  <div v-if="isLoadingProject" class="flex h-full w-full items-center justify-center">
    <Loading />
  </div>
  <div v-else class="relative h-full w-full">
    <div class="mb-2 flex flex-col md:flex-row md:justify-between">
      <ProjectHeader :title="localProject?.title" @update:title="updateProjectTitle" />

      <div class="flex items-center gap-4">
        <ProjectSettings :project-title="localProject?.title" :project-id="projectId" />
        <ShowUpdateTime :last-update-time="formattedUpdateTime" />
      </div>
    </div>
    <KanbanBoard
      :project-id="projectId"
      :construction-container="localProject?.constructionContainer"
      @update:construction-container="updateConstructionContainer"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, watch } from 'vue';
import { onBeforeRouteLeave, useRoute } from 'vue-router';

import type { ProjectResponse } from '@/types/response';

import Loading from '@/components/core/loading/Loading.vue';
import KanbanBoard from '@/components/core/project/KanbanBoard.vue';
import ProjectHeader from '@/components/core/project/ProjectHeader.vue';
import ProjectSettings from '@/components/core/project/ProjectSettings.vue';
import ShowUpdateTime from '@/components/core/ShowUpdateTime.vue';
import { useProject } from '@/composables/useProject';
import { useProjectLocalStorage } from '@/composables/useProjectLocalStorage';
import { useUpdateTime } from '@/composables/useUpdateTime';
import { adjustTimeZone, formatDateTimeWithMinutes } from '@/utils/dateTime';

const route = useRoute();
const projectId = route.params.id as string;

// 獲取專案資料
const { isLoadingProject, fetchedProject, updateProject } = useProject(projectId);

// 獲取本地專案數據
const { localProject, hasChanges, initLocalProject, saveToLocalStorage } = useProjectLocalStorage(
  projectId,
  fetchedProject
);
const { lastUpdateTime, updateLastUpdateTime } = useUpdateTime();

// 監聽資料庫數據變化並初始化本地數據
watch(
  () => fetchedProject.value,
  (newVal: ProjectResponse | null) => {
    if (newVal) {
      initLocalProject();
    }
  },
  { immediate: true }
);

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

// 更新專案標題的方法
const updateProjectTitle = (newTitle: string) => {
  localProject.value.title = newTitle;
  saveToLocalStorage();
  updateLastUpdateTime();
};

// 更新工程容器的方法
const updateConstructionContainer = (containers: string[]) => {
  if (localProject.value) {
    localProject.value.constructionContainer = containers;
    saveToLocalStorage();
    updateLastUpdateTime();
  }
};

// 處理窗口關閉事件
const handleBeforeUnload = async (event: BeforeUnloadEvent): Promise<void> => {
  if (hasChanges.value && localProject.value) {
    try {
      // 使用 sendBeacon 進行非同步請求
      const url = `/api/projects/${projectId}`;
      const data = new Blob([JSON.stringify(localProject.value)], { type: 'application/json' });
      navigator.sendBeacon(url, data);

      // 同時嘗試使用 updateProject 保存數據
      updateProject(localProject.value)
        .then(() => {
          hasChanges.value = false;
        })
        .catch((error) => {
          console.error('保存數據失敗:', error);
        });
    } catch (error) {
      console.error('窗口關閉或刷新時保存數據失敗:', error);
    }
  }
};

// 頁面銷毀前保存數據
onBeforeUnmount(async () => {
  if (hasChanges.value && localProject.value) {
    await updateProject(localProject.value);
    hasChanges.value = false;
  }
});

// 路由離開前保存數據 - 直接調用 updateProject
onBeforeRouteLeave(async (_, __, next: any) => {
  if (hasChanges.value && localProject.value) {
    await updateProject(localProject.value);
    hasChanges.value = false;
  }
  next();
});

// 定期自動保存（每5分鐘）
let autoSaveInterval: number | null = null;

onMounted(() => {
  // 確保數據已經初始化
  if (fetchedProject.value && !localProject.value) {
    initLocalProject();
  }

  // 強制重新渲染一次，確保頁面元素可以響應點擊
  setTimeout(() => {
    if (localProject.value) {
      const temp = { ...localProject.value };
      localProject.value = null;
      localProject.value = temp;
    }
  }, 100);

  // 設置定期保存
  autoSaveInterval = window.setInterval(
    async () => {
      if (hasChanges.value && localProject.value) {
        await updateProject(localProject.value);
        hasChanges.value = false;
      }
    },
    5 * 60 * 1000
  );

  // 添加窗口關閉事件監聽器
  window.addEventListener('beforeunload', handleBeforeUnload);
});

onBeforeUnmount(() => {
  // 清理定時器
  if (autoSaveInterval !== null) {
    clearInterval(autoSaveInterval);
  }

  // 移除窗口關閉事件監聽器
  window.removeEventListener('beforeunload', handleBeforeUnload);
});
</script>

<style scoped></style>
