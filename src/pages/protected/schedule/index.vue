<template>
  <div class="flex h-full flex-col">
    <!-- Content Section -->
    <section class="flex-1 overflow-y-auto p-4">
      <ScheduleSection />
    </section>
  </div>
</template>

<script setup lang="ts">
import ScheduleSection from '@/components/schedule/ScheduleSection.vue';
</script>

<style scoped></style>
