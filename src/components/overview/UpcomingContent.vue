<template>
  <div class="my-6">
    <!-- Construction Containers Section -->
    <div class="grid grid-cols-1 md:flex md:flex-wrap">
      <div v-for="construction in filteredConstructionList" :key="construction.id">
        <UpcomingConstructionContainerItem
          :construction-id="construction.id"
          :construction-name="construction.name"
          :days-range="[0, 10]"
          :read-only="true"
          :tasks="tasksByConstruction(construction.id)"
          :project-title-list="projectTitleList"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TaskResponse } from '@/types/response';
import type { ConstructionSelection } from '@/types/selection';

import UpcomingConstructionContainerItem from '@/components/overview/UpcomingConstructionContainerItem.vue';

const { filteredConstructionList, filteredTasks, projectTitleList } = defineProps<{
  filteredConstructionList: ConstructionSelection[];
  filteredTasks: TaskResponse[];
  projectTitleList: Array<{ id: string; title: string }>;
}>();

// 按工程類型過濾任務
const tasksByConstruction = (constructionId: string): TaskResponse[] => {
  return filteredTasks.filter((f) => f.constructionType === constructionId);
};
</script>

<style scoped></style>
