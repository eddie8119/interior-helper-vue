<template>
  <div class="flex h-full w-full bg-gray-50">
    <!-- 主要內容區域 -->
    <div class="min-w-0 flex-1 bg-gray-50">
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
          ref="canvasRef"
          :floor-plan-image="currentFloorPlanImage"
          :image-style="imageStyle"
          :task-markers="taskMarkers"
          :selected-marker-id="selectedMarkerId"
          :is-adding-marker="isAddingMarker"
          :is-adding-pin="isAddingPin"
          :pin-position="pinPosition"
          :is-dragging-existing-pin="isDraggingExistingPin"
          :dragging-existing-task-id="draggingExistingTaskId"
          :fixed-pins="fixedPins"
          :get-marker-style="getMarkerStyle"
          @wheel="handleWheel"
          @mousedown="handleCanvasMouseDown"
          @mousemove="handleCanvasMouseMove"
          @mouseup="handleCanvasMouseUp"
          @container-click="handleContainerClick"
          @image-load="handleImageLoad"
          @image-click="handleImageClickWithTask"
          @select-marker="selectMarker"
          @edit-marker="editMarker"
          @delete-marker="deleteMarkerById"
          @pin-click="handlePinClickFromCanvas"
          @pin-mousedown="handlePinMouseDownFromCanvas"
        />
      </div>
    </div>

    <!-- 右側任務列表 -->
    <div
      class="sticky top-0 z-10 max-h-screen w-80 shrink-0 overflow-y-auto border-l border-gray-200 bg-white"
    >
      <TaskSidebar
        :tasks="sortedTasks"
        :task-markers="taskMarkers"
        :selected-marker-id="selectedMarkerId"
        :highlighted-task-id="highlightedTaskId"
        :is-pinning="isAddingPin"
        :pinning-task-id="selectedTaskIdForPin"
        @select-task="handleTaskSelect"
        @link-task-to-marker="handleLinkTaskToMarker"
        @create-marker-for-task="selectTaskForPin"
        @remove-task-pin="handleRemoveTaskPin"
        @cancel-marker-for-task="handleCancelMarkerForTask"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus';
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';

import FloorPlanCanvas from './FloorPlanCanvas.vue';
import FloorPlanToolbar from './FloorPlanToolbar.vue';
import TaskSidebar from './TaskSidebar.vue';

import type { FloorPlanItem, TaskResponse } from '@/types/response';
import type { CreateProjectSchema } from '@/utils/schemas/createProjectSchema';

import UploadArea from '@/components/core/input/UploadArea.vue';
import { useFloorPlanImage } from '@/composables/floorPlan/useFloorPlanImage';
import { useFloorPlanPinning } from '@/composables/floorPlan/useFloorPlanPinning';
import { useFloorPlanTaskMarker } from '@/composables/floorPlan/useFloorPlanTaskMarker';
import { useFloorPlanUploadHandler } from '@/composables/floorPlan/useFloorPlanUploadHandler';
import { useTasks } from '@/composables/query/useTasks';
import { useFloorPlan } from '@/composables/useFloorPlan';

const props = withDefaults(
  defineProps<{
    floorPlanUrls?: FloorPlanItem[] | null;
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
const canvasRef = ref<InstanceType<typeof FloorPlanCanvas> | null>(null);

// 任務管理
const tasksRef = ref(props.tasks);
const { updateTask } = useTasks(props.projectId);

const highlightedTaskId = ref<string | null>(null);
let highlightTimer: ReturnType<typeof setTimeout> | null = null;

const triggerTaskHighlight = (taskId: string) => {
  highlightedTaskId.value = taskId;
  if (highlightTimer) {
    clearTimeout(highlightTimer);
  }
  highlightTimer = setTimeout(() => {
    highlightedTaskId.value = null;
    highlightTimer = null;
  }, 1200);
};

// 任務按創建時間排序（最新的在前）
const sortedTasks = computed(() => {
  if (!tasksRef.value) return [];
  return [...tasksRef.value].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA; // 降序排列，最新的在前
  });
});

// 同步子組件暴露的 DOM 引用
onMounted(() => {
  if (canvasRef.value) {
    imageContainer.value = canvasRef.value.imageContainer;
    floorPlanImg.value = canvasRef.value.floorPlanImg;
  }
});

// 監聽 props.tasks 變化
watch(
  () => props.tasks,
  (newTasks) => {
    tasksRef.value = newTasks;
  },
  { deep: true }
);

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
  isResettingFloorPlan,
  allFloorPlanUrls,
  currentFloorPlanImage,
  currentFloorPlanKey,
  prevImage,
  nextImage,
  addUploadedImage,
  resetFloorPlan,
  confirmResetFloorPlan,
  cancelResetFloorPlan,
} = useFloorPlanImage({
  floorPlanUrls: computed(() => props.floorPlanUrls ?? []),
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

// 釘選功能 composable
const {
  isAddingPin,
  selectedTaskIdForPin,
  pinPosition,
  isDraggingPin,
  isDraggingExistingPin,
  pendingExistingPinTaskId,
  draggingExistingTaskId,
  startDraggingExistingPin,
  updateExistingPinPosition,
  endDraggingExistingPin,
  selectTaskForPin,
  cancelPin,
  startDraggingPin,
  updatePinPosition,
  endDraggingPin,
  getPinPixelPosition,
  pinsOnCurrentImage,
} = useFloorPlanPinning({
  tasks: tasksRef,
  currentFloorPlanKey,
  scale,
  translateX,
  translateY,
  imageContainer,
  floorPlanImg,
  updateTask,
});

// 將當前圖片上的 pin 位置轉為像素點陣列供畫布渲染
const fixedPins = computed(() => {
  if (!pinsOnCurrentImage.value)
    return [] as Array<{ x: number; y: number; taskId: string; title: string }>;
  return pinsOnCurrentImage.value
    .map((p) => {
      const pos = getPinPixelPosition(p.pinLocation);
      if (!pos) return null;
      return { x: pos.x, y: pos.y, taskId: p.taskId, title: p.taskTitle };
    })
    .filter((v): v is { x: number; y: number; taskId: string; title: string } => !!v);
});

// 包裝 handleMouseDown 以傳遞 isAddingMarker 或釘選
const handleCanvasMouseDown = (event: MouseEvent) => {
  if (isAddingPin.value) {
    startDraggingPin(event);
    return;
  }
  // 若正在按住 TaskPin（尚未達門檻）或已在拖拽既有釘選，禁止底圖開始平移
  if (
    pendingExistingPinTaskId.value ||
    isDraggingExistingPin.value ||
    draggingExistingTaskId.value
  ) {
    return;
  }
  handleMouseDownInternal(event, isAddingMarker.value);
};

// 包裝 handleMouseMove 以支持釘選拖拽
const handleCanvasMouseMove = (event: MouseEvent) => {
  // 先交給既有釘選的拖拽門檻邏輯決定是否進入拖拽
  updateExistingPinPosition(event);
  if (isDraggingExistingPin.value) return;
  if (isDraggingPin.value) {
    updatePinPosition(event);
    return;
  }
  handleMouseMove(event);
};

// 包裝 handleMouseUp 以支持釘選拖拽結束
const handleCanvasMouseUp = async (event: MouseEvent) => {
  // 先讓既有釘選的門檻處理點擊/拖拽結束
  const handled = await endDraggingExistingPin(event);
  if (handled) return;
  if (isDraggingPin.value) {
    await endDraggingPin(event);
    return;
  }
  handleMouseUp();
};

const handlePinClickFromCanvas = (taskId: string) => {
  handleTaskSelect(taskId);
  triggerTaskHighlight(taskId);
};

const handlePinMouseDownFromCanvas = (payload: { taskId: string; event: MouseEvent }) => {
  startDraggingExistingPin(payload.taskId, payload.event);
};

const handleCancelMarkerForTask = (taskId: string) => {
  if (!isAddingPin.value || selectedTaskIdForPin.value !== taskId) return;
  cancelPin();
  ElMessage.info('已取消標記');
};

const handleRemoveTaskPin = async (taskId: string) => {
  try {
    const result = await updateTask(taskId, { pinLocation: null });
    if (result?.success) {
      ElMessage.success('已移除釘選');
      if (tasksRef.value) {
        const idx = tasksRef.value.findIndex((task) => task.id === taskId);
        if (idx !== -1) {
          tasksRef.value[idx] = {
            ...tasksRef.value[idx],
            pinLocation: null,
          };
        }
      }
    } else {
      ElMessage.error('移除釘選失敗');
    }
  } catch (error) {
    console.error('Failed to remove task pin:', error);
    ElMessage.error('移除釘選失敗');
  }
};

// 任務與標記關聯 composable
const { handleImageClickWithTask, handleTaskSelect, handleLinkTaskToMarker } =
  useFloorPlanTaskMarker({
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

onBeforeUnmount(() => {
  if (highlightTimer) {
    clearTimeout(highlightTimer);
  }
});
</script>
