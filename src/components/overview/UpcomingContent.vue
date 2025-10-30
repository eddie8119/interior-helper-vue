<template>
  <div class="my-6">
    <!-- Construction Containers Section -->
    <div class="grid grid-cols-1 gap-4 md:flex md:flex-wrap">
      <div v-for="construction in filteredConstructionList" :key="construction.id">
        <UpcomingConstructionContainerItem
          :construction-id="construction.id"
          :construction-name="construction.name"
          :days-range="[0, 10]"
          :read-only="true"
        />
      </div>
    </div>

    <!-- All Tasks Section -->
    <div>
      <h2 class="mb-4 text-lg font-semibold">All Tasks</h2>
      <div v-if="filteredTasks.length > 0" class="space-y-2">
        <div
          v-for="task in filteredTasks"
          :key="task.id"
          class="rounded-lg border border-gray-200 bg-white p-3 shadow-sm"
        >
          <p class="font-medium text-gray-900">{{ task.title }}</p>
          <p class="text-sm text-gray-600">Status: {{ task.status }}</p>
        </div>
      </div>
      <div v-else class="text-center text-gray-500">
        <p>No tasks available</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TaskResponse } from '@/types/response';
import type { ConstructionSelection } from '@/types/selection';

import UpcomingConstructionContainerItem from '@/components/overview/UpcomingConstructionContainerItem.vue';

defineProps<{
  filteredConstructionList: ConstructionSelection[];
  filteredTasks: TaskResponse[];
}>();

// 按工程類型過濾任務
// const filteredTasksByConstruction = (constructionId: string) => {
//   return filterTasksByConstruction(filteredTasks.value, constructionId);
// };
</script>

<style scoped></style>
