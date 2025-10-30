<template>
  <UpcomingFilterBar
    :construction-list="constructionList"
    :project-title-list="projectTitleList"
    :selected-construction-ids="selectedConstructionIds"
    :selected-project-ids="selectedProjectIds"
    @toggle-construction="toggleConstruction"
    @toggle-project="toggleProject"
  />
  <Loading v-if="isLoadingAllTasks || isLoadingOverviewProjects" />
  <div v-else class="space-y-6">
    <!-- Construction Containers Section -->
    <div>
      <h2 class="mb-4 text-lg font-semibold">Construction Types</h2>
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="construction in constructionList"
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
import Loading from '@/components/core/loading/Loading.vue';
import UpcomingFilterBar from '@/components/overview/UpcomingFilterBar.vue';
import { useOverviewSources } from '@/composables/useOverviewSources';
import { useTasks } from '@/composables/useTasks';
import { useUpcomingFilters } from '@/composables/useUpcomingFilters';

const { fetchedAllTasks, isLoadingAllTasks } = useTasks();
const { fetchedOverviewProjects, isLoadingOverviewProjects, constructionList, projectTitleList } =
  useOverviewSources();
const {
  selectedConstructionIds,
  selectedProjectIds,
  toggleConstruction,
  toggleProject,
  filteredTasks,
} = useUpcomingFilters({
  fetchedAllTasks,
  fetchedOverviewProjects,
});
</script>

<style scoped></style>
