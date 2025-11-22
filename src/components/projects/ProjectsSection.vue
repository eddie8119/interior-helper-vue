<template>
  <Loading v-if="isLoadingOverviewProjects" />
  <div v-else class="flex flex-col gap-16">
    <ProjectsBulletinBoard
      :tasks="fetchedAllTasks"
      :projects="fetchedOverviewProjects"
      :is-loading="isLoadingOverviewProjects"
      :last-updated="overviewProjectsUpdatedAt"
    />
    <ProjectsPlanOverview :projects="fetchedOverviewProjects" />
  </div>
</template>

<script setup lang="ts">
import Loading from '@/components/core/loading/Loading.vue';
import ProjectsBulletinBoard from '@/components/core/situationRoom/ProjectsBulletinBoard.vue';
import ProjectsPlanOverview from '@/components/projects/ProjectsPlanOverview.vue';
import { useOverviewProjects } from '@/composables/query/useProjects';
import { useTasks } from '@/composables/query/useTasks';

const { fetchedAllTasks } = useTasks();
const { fetchedOverviewProjects, isLoadingOverviewProjects, overviewProjectsUpdatedAt } =
  useOverviewProjects();
</script>

<style lang="scss" scoped></style>
