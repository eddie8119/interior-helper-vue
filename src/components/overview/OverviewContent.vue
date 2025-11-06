<template>
  <div class="mt-6 w-full md:overflow-x-auto">
    <div class="grid grid-cols-1 gap-4 md:flex md:flex-nowrap md:gap-0">
      <div
        v-for="construction in filteredConstructionList"
        :key="construction.id"
        class="flex-shrink-0"
      >
        <OverviewConstructionContainerItem
          :construction-id="construction.id"
          :construction-name="construction.name"
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

import OverviewConstructionContainerItem from '@/components/overview/OverviewConstructionContainerItem.vue';

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
