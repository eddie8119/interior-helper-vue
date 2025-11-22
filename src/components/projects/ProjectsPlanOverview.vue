<template>
  <div class="grid grid-cols-4 gap-5">
    <div
      v-for="project in projectsWithImages"
      :key="project.id"
      class="panel-container flex w-full flex-col gap-2 border border-gray-200"
    >
      <H3Title :title="project.title" />

      <ImageCarousel :images="project.floorPlanUrls" :alt-text="'Floor plan '" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

import type { ProjectResponse } from '@/types/response';

import ImageCarousel from '@/components/core/carousel/ImageCarousel.vue';
import H3Title from '@/components/core/title/H3Title.vue';

const props = defineProps<{
  projects: ProjectResponse[] | undefined;
}>();

const projectsWithImages = computed(() => {
  return (
    props.projects?.filter(
      (project) => project.floorPlanUrls && project.floorPlanUrls.length > 0
    ) || []
  );
});
</script>

<style scoped>
.panel-container {
  background-color: transparent !important;
}
</style>
