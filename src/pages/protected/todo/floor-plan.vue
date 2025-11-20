<template>
  <div
    v-if="isLoadingProject || isLoadingTasks"
    class="flex h-full w-full items-center justify-center"
  >
    <Loading />
  </div>
  <FloorPlanContainer
    v-else
    :floor-plan-urls="fetchedProject?.floorPlanUrls || []"
    :project-id="projectId"
    :update-project="updateProject"
    :tasks="fetchedTasks"
  />
</template>

<script setup lang="ts">
import Loading from '@/components/core/loading/Loading.vue';
import FloorPlanContainer from '@/components/plan/FloorPlanContainer.vue';
import { useProject } from '@/composables/useProject';
import { useProjectId } from '@/composables/useProjectId';
import { useTasks } from '@/composables/useTasks';

const { projectId } = useProjectId();
const { isLoadingProject, fetchedProject, updateProject } = useProject(projectId);
const { isLoadingTasks, fetchedTasks } = useTasks(projectId);
</script>

<style scoped></style>
