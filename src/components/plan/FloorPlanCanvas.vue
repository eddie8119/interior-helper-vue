<template>
  <div
    ref="imageContainer"
    class="relative h-full w-full overflow-hidden"
    :class="
      isHoveringPin
        ? 'cursor-pointer'
        : isAddingPin
          ? 'cursor-grab active:cursor-grabbing'
          : isAddingMarker
            ? 'cursor-crosshair'
            : 'cursor-move'
    "
    @wheel.prevent="$emit('wheel', $event)"
    @mousedown="$emit('mousedown', $event)"
    @mousemove="$emit('mousemove', $event)"
    @mouseup="$emit('mouseup', $event)"
    @mouseleave="$emit('mouseup')"
    @click="$emit('container-click', $event)"
  >
    <img
      ref="floorPlanImg"
      :src="floorPlanImage"
      :style="imageStyle"
      class="select-none transition-transform duration-200"
      style="max-width: none; max-height: none; object-fit: contain"
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

    <!-- 已保存的釘選 -->
    <div
      v-for="p in fixedPins"
      v-show="!(isDraggingExistingPin && draggingExistingTaskId === p.taskId)"
      :key="p.taskId"
      class="absolute z-40 transition-all"
      :class="{ 'duration-0': isDraggingExistingPin, 'duration-150': !isDraggingExistingPin }"
      :title="p.title"
      :style="{
        left: `${p.x}px`,
        top: `${p.y}px`,
        transform: isDraggingExistingPin
          ? 'translate(-50%, -100%) scale(1.15)'
          : 'translate(-50%, -100%)',
        willChange: 'transform',
      }"
      @mouseenter="handlePinMouseEnter"
      @mouseleave="handlePinMouseLeave"
      @mousedown.stop="$emit('pin-mousedown', { taskId: p.taskId, event: $event })"
    >
      <TaskPin
        :title="p.title"
        @click="handlePinClick(p.taskId)"
        @pin-mousedown="$emit('pin-mousedown', { taskId: p.taskId, event: $event })"
      />
    </div>

    <!-- 既有釘選拖拽中的浮動預覽 -->
    <div
      v-if="isDraggingExistingPin"
      class="pointer-events-none absolute z-50 flex items-center justify-center"
      :style="{
        left: `${pinPosition.x}px`,
        top: `${pinPosition.y}px`,
        transform: 'translate(-50%, -100%)',
      }"
    >
      <TaskPin :title="fixedPins.find((fp) => fp.taskId === draggingExistingTaskId)?.title || ''" />
    </div>

    <!-- 釘選大頭釘 - 浮動動效 -->
    <div
      v-if="isAddingPin"
      class="pointer-events-none absolute z-50 flex items-center justify-center"
      :style="{
        left: `${pinPosition.x}px`,
        top: `${pinPosition.y}px`,
        transform: 'translate(-50%, -50%)',
        animation: 'float 2s ease-in-out infinite',
      }"
    >
      <div class="text-4xl drop-shadow-lg">📍</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import FloorPlanMarkerPoint from './FloorPlanMarkerPoint.vue';

import type { TaskMarker } from '@/utils/floorPlan/floorPlanMarker';

import TaskPin from '@/components/core/TaskPin.vue';

defineProps<{
  floorPlanImage: string;
  imageStyle: Record<string, string>;
  taskMarkers: TaskMarker[];
  selectedMarkerId: string | null;
  isAddingMarker: boolean;
  isAddingPin: boolean;
  pinPosition: { x: number; y: number };
  isDraggingExistingPin: boolean;
  draggingExistingTaskId: string | null;
  fixedPins: Array<{ x: number; y: number; taskId: string; title: string }>;
  getMarkerStyle: (marker: TaskMarker) => Record<string, string>;
}>();

const emit = defineEmits<{
  wheel: [event: WheelEvent];
  mousedown: [event: MouseEvent];
  mousemove: [event: MouseEvent];
  mouseup: [event: MouseEvent];
  'container-click': [event: MouseEvent];
  'image-load': [];
  'image-click': [event: MouseEvent];
  'select-marker': [markerId: string];
  'edit-marker': [markerId: string];
  'delete-marker': [markerId: string];
  'pin-hover': [isHovering: boolean];
  'pin-click': [taskId: string];
  'pin-mousedown': [payload: { taskId: string; event: MouseEvent }];
}>();

const imageContainer = ref<HTMLDivElement>();
const floorPlanImg = ref<HTMLImageElement>();

const isHoveringPin = ref(false);

const handlePinMouseEnter = () => {
  isHoveringPin.value = true;
  emit('pin-hover', true);
};

const handlePinMouseLeave = () => {
  isHoveringPin.value = false;
  emit('pin-hover', false);
};

const handlePinClick = (taskId: string) => {
  emit('pin-click', taskId);
};

defineExpose({ imageContainer, floorPlanImg });
</script>

<style scoped>
@keyframes float {
  0%,
  100% {
    transform: translate(-50%, -50%);
  }
  50% {
    transform: translate(-50%, calc(-50% - 8px));
  }
}
</style>
