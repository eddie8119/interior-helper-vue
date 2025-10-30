<template>
  <div class="construction-container" style="overflow: visible">
    <p>{{ constructionName }}</p>
    <!-- <ContainerBody
      :construction-id="props.constructionId"
      :project-id="props.projectId"
      :tasks="filteredTasks"
      :read-only="readOnly"
      @update:tasks="updateTasks"
      @task-drop="handleTaskDrop"
    /> -->
  </div>
</template>

<script setup lang="ts">
import type { TaskResponse } from '@/types/response';

const props = defineProps<{
  constructionId: string;
  constructionName: string;
  daysRange?: [number, number];
  readOnly?: boolean;
}>();
</script>
