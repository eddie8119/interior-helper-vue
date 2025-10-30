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
  <div v-else>
    <UpcomingContent
      :filtered-construction-list="filteredConstructionList"
      :filtered-tasks="filteredTasks"
      :project-title-list="projectTitleList"
    />
  </div>
</template>

<script setup lang="ts">
import Loading from '@/components/core/loading/Loading.vue';
import UpcomingContent from '@/components/overview/UpcomingContent.vue';
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
  filteredConstructionList,
} = useUpcomingFilters({
  fetchedAllTasks,
  fetchedOverviewProjects,
  constructionList,
});
</script>

<style scoped></style>
