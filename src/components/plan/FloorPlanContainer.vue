<template>
  <div class="h-full w-full bg-gray-50">
    <!-- 上傳區域 -->
    <FloorPlanUploadArea
      v-if="!floorPlanImage"
      @file-select="handleFileSelect"
      @file-drop="handleFileDrop"
    />

    <!-- 平面圖顯示區域 -->
    <div v-else class="relative h-full w-full overflow-hidden">
      <!-- 工具列 -->
      <FloorPlanToolbar
        :scale="scale"
        :is-adding-marker="isAddingMarker"
        @reset-floor-plan="resetFloorPlan"
        @reset-zoom="resetZoom"
        @toggle-add-marker="toggleAddMarker"
      />

      <!-- 平面圖容器 -->
      <FloorPlanCanvas
        :floor-plan-image="floorPlanImage"
        :image-style="imageStyle"
        :task-markers="taskMarkers"
        :selected-marker-id="selectedMarkerId"
        :is-adding-marker="isAddingMarker"
        :get-marker-style="getMarkerStyle"
        @wheel="handleWheel"
        @mousedown="handleMouseDown"
        @mousemove="handleMouseMove"
        @mouseup="handleMouseUp"
        @container-click="handleContainerClick"
        @image-load="handleImageLoad"
        @image-click="handleImageClick"
        @select-marker="selectMarker"
        @edit-marker="editMarker"
        @delete-marker="deleteMarkerById"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import FloorPlanCanvas from './FloorPlanCanvas.vue';
import FloorPlanToolbar from './FloorPlanToolbar.vue';
import FloorPlanUploadArea from './FloorPlanUploadArea.vue';

import { useFloorPlan } from '@/composables/useFloorPlan';

// 模板引用
const imageContainer = ref<HTMLDivElement>();
const floorPlanImg = ref<HTMLImageElement>();

// 使用平面圖 composable
const {
  // 圖片上傳
  floorPlanImage,
  handleFileSelect,
  handleFileDrop,
  resetFloorPlan,

  // 縮放和平移
  scale,
  imageStyle,
  resetZoom,
  handleImageLoad,

  // 拖拽
  handleMouseDown: handleMouseDownInternal,
  handleMouseMove,
  handleMouseUp,
  handleWheel,

  // 標記點
  taskMarkers,
  isAddingMarker,
  selectedMarkerId,
  toggleAddMarker,
  getMarkerStyle,
  handleImageClick,
  handleContainerClick,
  selectMarker,
  editMarker,
  deleteMarkerById,
} = useFloorPlan({ imageContainer, floorPlanImg });

// 包裝 handleMouseDown 以傳遞 isAddingMarker
const handleMouseDown = (event: MouseEvent) => {
  handleMouseDownInternal(event, isAddingMarker.value);
};
</script>
