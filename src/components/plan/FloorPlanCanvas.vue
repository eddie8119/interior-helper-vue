<template>
  <div
    ref="imageContainer"
    class="h-full w-full overflow-hidden"
    :class="isAddingMarker ? 'cursor-crosshair' : 'cursor-move'"
    @wheel.prevent="$emit('wheel', $event)"
    @mousedown="$emit('mousedown', $event)"
    @mousemove="$emit('mousemove', $event)"
    @mouseup="$emit('mouseup')"
    @mouseleave="$emit('mouseup')"
    @click="$emit('container-click', $event)"
  >
    <img
      ref="floorPlanImg"
      :src="floorPlanImage"
      :style="imageStyle"
      class="select-none transition-transform duration-200"
      alt="平面圖"
      draggable="false"
      @load="$emit('image-load')"
      @click="$emit('image-click', $event)"
    />

    <!-- 任務標記點 -->
    <FloorPlanMarkerPoint
      v-for="marker in taskMarkers"
      :key="marker.id"
      :marker="marker"
      :marker-style="getMarkerStyle(marker)"
      :is-selected="selectedMarkerId === marker.id"
      @select="$emit('select-marker', marker.id)"
      @edit="$emit('edit-marker', marker.id)"
      @delete="$emit('delete-marker', marker.id)"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import FloorPlanMarkerPoint from './FloorPlanMarkerPoint.vue';

import type { TaskMarker } from '@/utils/floorPlan/floorPlanMarker';

defineProps<{
  floorPlanImage: string;
  imageStyle: Record<string, string>;
  taskMarkers: TaskMarker[];
  selectedMarkerId: string | null;
  isAddingMarker: boolean;
  getMarkerStyle: (marker: TaskMarker) => Record<string, string>;
}>();

defineEmits<{
  wheel: [event: WheelEvent];
  mousedown: [event: MouseEvent];
  mousemove: [event: MouseEvent];
  mouseup: [];
  'container-click': [event: MouseEvent];
  'image-load': [];
  'image-click': [event: MouseEvent];
  'select-marker': [markerId: string];
  'edit-marker': [markerId: string];
  'delete-marker': [markerId: string];
}>();

const imageContainer = ref<HTMLDivElement>();
const floorPlanImg = ref<HTMLImageElement>();

defineExpose({
  imageContainer,
  floorPlanImg,
});
</script>
