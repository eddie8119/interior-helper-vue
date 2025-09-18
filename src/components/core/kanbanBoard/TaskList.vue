<template>
  <Container>
    <Draggable v-for="task in props.tasks" :key="task.id">
      <div class="p-2">{{ task.title }}</div>
    </Draggable>
  </Container>
</template>

<script setup lang="ts">
import { Container, Draggable } from 'vue3-smooth-dnd';

import type { TaskData } from '@/types/task';

const props = defineProps<{
  tasks: TaskData[];
}>();
</script>

<style scoped></style>
