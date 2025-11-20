<template>
  <FloorPlanContainer />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';

import FloorPlanContainer from '@/components/plan/FloorPlanContainer.vue';

const route = useRoute();
const _projectId = route.params.id as string;
</script>

<style scoped></style>
