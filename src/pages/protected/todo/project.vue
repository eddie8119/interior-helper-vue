<template>
  <Loading v-if="isLoadingProject" />
  <div v-else class="relative">
    <ProjectHeader
      v-if="fetchedProject"
      :title="fetchedProject.title"
      @update:title="updateProjectTitle"
    />
    <ShowUpdateTime
      :last-update-time="formatDateTimeWithMinutes(new Date(fetchedProject?.updatedAt || ''))"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useProject } from '@/composables/useProject';
import Loading from '@/components/core/loading/Loading.vue';
import ProjectHeader from '@/components/core/project/ProjectHeader.vue';
import ShowUpdateTime from '@/components/core/ShowUpdateTime.vue';
import { formatDateTimeWithMinutes } from '@/utils/dateTime';

const route = useRoute();
const projectId = route.params.id as string;

// 使用 composable 獲取專案資料
const { isLoadingProject, fetchedProject, refetchProject } = useProject(projectId);

// 更新專案標題的方法
const updateProjectTitle = async (newTitle: string) => {
  if (fetchedProject.value && fetchedProject.value.title !== newTitle) {
    // 這裡應該調用 API 來更新專案標題
    // 例如: await projectApi.updateProject(projectId, { title: newTitle });
    // 然後重新獲取專案資料
    await refetchProject();
  }
};
</script>

<style scoped></style>
