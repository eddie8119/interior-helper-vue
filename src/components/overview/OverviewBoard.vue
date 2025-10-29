<template>
  <Loading v-if="isLoadingAllTasks || isLoadingOverviewProjects" />
  <div v-else class="space-y-6">
    <!-- Construction Containers Section -->
    <div>
      <h2 class="mb-4 text-lg font-semibold">Construction Types</h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="construction in uniqueConstructions"
          :key="construction.id"
          class="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
        >
          <p class="font-medium text-gray-900">{{ construction.name }}</p>
        </div>
      </div>
    </div>

    <!-- All Tasks Section -->
    <div>
      <h2 class="mb-4 text-lg font-semibold">All Tasks</h2>
      <div v-if="fetchedAllTasks && fetchedAllTasks.length > 0" class="space-y-2">
        <div
          v-for="task in fetchedAllTasks"
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
import { computed } from 'vue';

import type { ProjectResponse } from '@/types/response';
import type { ConstructionSelection } from '@/types/selection';

import Loading from '@/components/core/loading/Loading.vue';
import { useProjects } from '@/composables/useProjects';
import { useTasks } from '@/composables/useTasks';

const { fetchedAllTasks, isLoadingAllTasks } = useTasks();
const { fetchedOverviewProjects, isLoadingOverviewProjects } = useProjects();

// Extract and deduplicate construction containers
const uniqueConstructions = computed(() => {
  if (!fetchedOverviewProjects.value || fetchedOverviewProjects.value.length === 0) {
    return [];
  }

  // Collect all construction containers
  const allConstructions = fetchedOverviewProjects.value.flatMap((project: ProjectResponse) => {
    return project.constructionContainer || [];
  });

  // Deduplicate by id
  const seen = new Set<string>();
  const unique = allConstructions.filter((construction: ConstructionSelection) => {
    if (seen.has(construction.id)) {
      return false;
    }
    seen.add(construction.id);
    return true;
  });

  return unique;
});

// Extract project id and title
const projectTitleList = computed(() => {
  if (!fetchedOverviewProjects.value || fetchedOverviewProjects.value.length === 0) {
    return [] as Array<{ id: string; title: string }>;
  }
  return fetchedOverviewProjects.value.map((project: ProjectResponse) => ({
    id: project.id,
    title: project.title,
  }));
});
</script>

<style scoped></style>
