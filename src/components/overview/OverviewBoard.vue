<template>
  <Loading v-if="isLoadingAllTasks || isLoadingOverviewProjects" />
  <div v-else>
    <OverviewTaskFilterBar
      :construction-list="constructionList"
      :project-title-list="projectTitleList"
      :selected-construction-ids="selectedConstructionIds"
      :selected-project-ids="selectedProjectIds"
      @toggle-construction="toggleConstruction"
      @toggle-project="toggleProject"
    />
    <OverviewContent
      :filtered-construction-list="filteredConstructionList"
      :filtered-tasks="filteredTasks"
      :project-title-list="projectTitleList"
    />
  </div>
</template>

<script setup lang="ts">
import Loading from '@/components/core/loading/Loading.vue';
import OverviewContent from '@/components/overview/OverviewContent.vue';
import OverviewTaskFilterBar from '@/components/overview/OverviewTaskFilterBar.vue';
import { useOverviewSources } from '@/composables/useOverviewSources';
import { useTasks } from '@/composables/useTasks';
import { useUpcomingFilters } from '@/composables/useUpcomingFilters';
import { provideTaskCardFilter } from '@/context/useTaskCardFilter';

const { fetchedAllTasks, isLoadingAllTasks } = useTasks();
const { fetchedOverviewProjects, isLoadingOverviewProjects, constructionList, projectTitleList } =
  useOverviewSources();
const {
  selectedConstructionIds,
  selectedProjectIds,
  toggleConstruction,
  toggleProject,
  filteredTasks,
  filteredConstructionList,
} = useUpcomingFilters({
  fetchedAllTasks,
  fetchedOverviewProjects,
  constructionList,
});

provideTaskCardFilter();
</script>

<style scoped></style>
