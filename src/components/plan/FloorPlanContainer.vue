<template>
  <div class="flex h-full w-full bg-gray-50">
    <!-- 主要內容區域 -->
    <div class="flex-1 bg-gray-50">
      <div v-if="!currentFloorPlanImage" class="flex h-full items-center justify-center">
        <!-- 上傳區域 -->
        <UploadArea @file-select="handleFileSelect" @file-drop="handleFileDrop" />
      </div>

      <!-- 平面圖顯示區域 -->
      <div v-else class="relative h-full w-full overflow-hidden">
        <!-- 工具列 -->
        <FloorPlanToolbar
          :scale="scale"
          :is-adding-marker="isAddingMarker"
          :is-confirming-reset="isResettingFloorPlan"
          :has-multiple-images="allFloorPlanUrls.length > 1"
          :current-image-index="currentImageIndex"
          :total-images="allFloorPlanUrls.length"
          @reset-floor-plan="resetFloorPlan"
          @confirm-reset-floor-plan="confirmResetFloorPlan"
          @cancel-reset-floor-plan="cancelResetFloorPlan"
          @reset-zoom="resetZoom"
          @toggle-add-marker="toggleAddMarker"
          @prev-image="prevImage"
          @next-image="nextImage"
        />

        <!-- 平面圖容器 -->
        <FloorPlanCanvas
          :floor-plan-image="currentFloorPlanImage"
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
          @image-click="handleImageClickWithTask"
          @select-marker="selectMarker"
          @edit-marker="editMarker"
          @delete-marker="deleteMarkerById"
        />
      </div>
    </div>

    <!-- 右側任務列表 -->
    <div class="w-80 border-l border-gray-200 bg-white">
      <TaskSidebar
        :tasks="sortedTasks"
        :task-markers="taskMarkers"
        :selected-marker-id="selectedMarkerId"
        @select-task="handleTaskSelect"
        @link-task-to-marker="handleLinkTaskToMarker"
        @create-marker-for-task="handleCreateMarkerForTask"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';

import FloorPlanCanvas from './FloorPlanCanvas.vue';
import FloorPlanToolbar from './FloorPlanToolbar.vue';
import TaskSidebar from './TaskSidebar.vue';

import type { TaskResponse } from '@/types/response';
import type { CreateProjectSchema } from '@/utils/schemas/createProjectSchema';

import UploadArea from '@/components/core/input/UploadArea.vue';
import { useFloorPlanImage } from '@/composables/floorPlan/useFloorPlanImage';
import { useFloorPlanTaskMarker } from '@/composables/floorPlan/useFloorPlanTaskMarker';
import { useFloorPlanUploadHandler } from '@/composables/floorPlan/useFloorPlanUploadHandler';
import { useFloorPlan } from '@/composables/useFloorPlan';

const props = withDefaults(
  defineProps<{
    floorPlanUrls?: string[];
    projectId: string;
    tasks: TaskResponse[] | null;
    updateProject: (data: Partial<CreateProjectSchema>) => Promise<unknown>;
  }>(),
  {
    floorPlanUrls: () => [],
  }
);

// 模板引用
const imageContainer = ref<HTMLDivElement>();
const floorPlanImg = ref<HTMLImageElement>();

// 任務按創建時間排序（最新的在前）
const sortedTasks = computed(() => {
  if (!props.tasks) return [];
  return [...props.tasks].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA; // 降序排列，最新的在前
  });
});

// 使用平面圖 composables
const {
  // 縮放和平移
  scale,
  translateX,
  translateY,
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
  handleContainerClick,
  selectMarker,
  editMarker,
  deleteMarkerById,
  createMarker,
} = useFloorPlan({
  imageContainer,
  floorPlanImg,
  projectId: props.projectId,
  updateProject: props.updateProject,
});

// 圖片管理 composable
const {
  currentImageIndex,
  uploadedImages,
  isResettingFloorPlan,
  allFloorPlanUrls,
  currentFloorPlanImage,
  prevImage,
  nextImage,
  addUploadedImage,
  resetFloorPlan,
  confirmResetFloorPlan,
  cancelResetFloorPlan,
} = useFloorPlanImage({
  floorPlanUrls: computed(() => props.floorPlanUrls || []),
  updateProject: props.updateProject,
  onResetComplete: () => {
    resetZoom();
    taskMarkers.value = [];
  },
});

// 文件上傳處理 composable
const { handleFileSelect, handleFileDrop } = useFloorPlanUploadHandler({
  onImageAdded: addUploadedImage,
});

// 包裝 handleMouseDown 以傳遞 isAddingMarker
const handleMouseDown = (event: MouseEvent) => {
  handleMouseDownInternal(event, isAddingMarker.value);
};

// 任務與標記關聯 composable
const {
  handleImageClickWithTask,
  handleTaskSelect,
  handleCreateMarkerForTask,
  handleLinkTaskToMarker,
} = useFloorPlanTaskMarker({
  taskMarkers,
  isAddingMarker,
  selectedMarkerId,
  scale,
  translateX,
  translateY,
  imageContainer,
  floorPlanImg,
  createMarker,
  selectMarker,
  tasks: computed(() => props.tasks),
});

// 當圖片變化時重置縮放
watch(currentFloorPlanImage, () => {
  if (currentFloorPlanImage.value) {
    // 延遲執行以確保圖片已載入
    setTimeout(() => {
      resetZoom();
    }, 100);
  }
});
</script>
