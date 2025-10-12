<template>
  <SlidePanel
    v-model="isNotificationSlideVisible"
    side="right"
    :topOffsetRem="4"
    :widthPercent="45"
    :maxWidthPx="350"
    @close="hideNotificationSlide"
  >
    <!-- Notification slot content goes here -->
    <div class="min-h-full">
      <!-- Notification -->
    </div>
  </SlidePanel>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import SlidePanel from '@/components/ui/SlidePanel.vue';
import { useSlideStore } from '@/stores/slide';

const slideStore = useSlideStore();
const { isNotificationSlideVisible } = storeToRefs(slideStore);
const { hideNotificationSlide } = slideStore;
</script>
