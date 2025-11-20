<template>
  <button
    class="fixed bottom-6 right-6 z-[998] flex h-14 w-14 items-center justify-center rounded-full bg-brand-primary text-white shadow-lg hover:bg-brand-secondary focus:outline-none focus:ring-2 focus:ring-blue-300"
    aria-label="Toggle Quick Draft"
    @click="toggleQuickDraftSlide"
  >
    <img src="@/assets/icons/Lightning.svg" alt="Quick Draft" class="h-6 w-6" />
  </button>
</template>

<script setup lang="ts">
import { useSlideStore } from '@/stores/slide';

const slideStore = useSlideStore();
const { toggleQuickDraftSlide } = slideStore;
</script>
