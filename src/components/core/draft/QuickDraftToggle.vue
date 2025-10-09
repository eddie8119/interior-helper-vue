<template>
  <button
    class="fixed bottom-6 right-6 z-[998] flex h-14 w-14 items-center justify-center rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
    aria-label="Toggle Quick Draft"
    @click="toggleQuickDraftSlide"
  >
    <PencilIcon />
  </button>
</template>

<script setup lang="ts">
import PencilIcon from '@/components/ui/PencilIcon.vue';
import { useQuickDraftStore } from '@/stores/quickDraft';

const quickDraftStore = useQuickDraftStore();
const { toggleQuickDraftSlide } = quickDraftStore;
</script>
