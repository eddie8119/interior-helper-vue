<template>
  <div class="relative">
    <!-- Main carousel -->
    <div class="relative h-48 overflow-hidden">
      <img
        v-for="(image, index) in images"
        :key="index"
        :src="image.data"
        :alt="altText + (index + 1)"
        class="absolute left-0 top-0 h-full w-full rounded object-contain opacity-0 transition-opacity duration-300"
        :class="{ 'opacity-100': activeIndex === index }"
      />

      <!-- Navigation arrows -->
      <button class="nav-arrow left-1" @click="prevImage">&lt;</button>
      <button class="nav-arrow right-1" @click="nextImage">&gt;</button>
    </div>

    <!-- Thumbnail indicators -->
    <div class="mt-3 flex justify-center gap-1.5">
      <div
        v-for="(image, index) in images"
        :key="index"
        class="h-1 w-6 cursor-pointer rounded bg-gray-300 transition-all duration-300"
        :class="{
          'scale-y-150 bg-blue-500': activeIndex === index,
          'bg-gray-300': activeIndex !== index,
        }"
        @click="activeIndex = index"
      />
    </div>

    <!-- Image counter -->
    <div class="text200-color-difference mt-1 text-center text-xs">
      {{ activeIndex + 1 }} / {{ images.length }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import type { FloorPlanItem } from '@/types/response';

const props = defineProps<{
  images: FloorPlanItem[];
  altText?: string;
}>();

const activeIndex = ref(0);

const nextImage = () => {
  activeIndex.value = (activeIndex.value + 1) % props.images.length;
};

const prevImage = () => {
  activeIndex.value = (activeIndex.value - 1 + props.images.length) % props.images.length;
};
</script>

<style scoped>
.nav-arrow {
  @apply absolute top-1/2 z-10 h-8 w-8 -translate-y-1/2 cursor-pointer rounded-full border-none bg-gray-200 bg-opacity-60 text-brand-secondary;
}
</style>
