/**
 * 平面圖釘選功能 composable
 * 管理任務在平面圖上的釘選位置
 */

import { computed, ref, type Ref } from 'vue';

import type { TaskResponse } from '@/types/response';

export interface PinLocation {
  floorPlanKey: string;
  xPercent: number;
  yPercent: number;
}

export interface UseFloorPlanPinningOptions {
  tasks: Ref<TaskResponse[] | null>;
  currentFloorPlanImage: Ref<string>;
  currentFloorPlanKey: Ref<string>; // 新增：當前圖片的 key
  scale: Ref<number>;
  translateX: Ref<number>;
  translateY: Ref<number>;
  imageContainer: Ref<HTMLDivElement | undefined>;
  floorPlanImg: Ref<HTMLImageElement | undefined>;
  updateTask: (taskId: string, data: Partial<TaskResponse>) => Promise<{ success: boolean }>;
}

export const useFloorPlanPinning = (options: UseFloorPlanPinningOptions) => {
  const {
    tasks,
    currentFloorPlanKey,
    scale,
    translateX,
    translateY,
    imageContainer,
    floorPlanImg,
    updateTask,
  } = options;

  // 釘選狀態
  const isAddingPin = ref(false);
  const selectedTaskIdForPin = ref<string | null>(null);
  const pinPosition = ref<{ x: number; y: number }>({ x: 0, y: 0 });
  const isDraggingPin = ref(false);

  // 選擇任務進行釘選
  const selectTaskForPin = (taskId: string) => {
    selectedTaskIdForPin.value = taskId;
    isAddingPin.value = true;
    // 初始化大頭釘位置在容器中心
    if (imageContainer.value) {
      pinPosition.value = {
        x: imageContainer.value.clientWidth / 2,
        y: imageContainer.value.clientHeight / 2,
      };
    }
  };

  // 取消釘選
  const cancelPin = () => {
    isAddingPin.value = false;
    selectedTaskIdForPin.value = null;
    isDraggingPin.value = false;
  };

  // 計算座標百分比
  const calculatePercentage = (
    clientX: number,
    clientY: number
  ): { xPercent: number; yPercent: number } | null => {
    if (!imageContainer.value || !floorPlanImg.value) return null;

    const rect = imageContainer.value.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;

    const centerX = imageContainer.value.clientWidth / 2;
    const centerY = imageContainer.value.clientHeight / 2;

    const imgDisplayWidth = floorPlanImg.value.naturalWidth * scale.value;
    const imgDisplayHeight = floorPlanImg.value.naturalHeight * scale.value;

    const imgLeft = centerX + translateX.value - imgDisplayWidth / 2;
    const imgTop = centerY + translateY.value - imgDisplayHeight / 2;

    const imgX = clickX - imgLeft;
    const imgY = clickY - imgTop;

    const xPercent = (imgX / imgDisplayWidth) * 100;
    const yPercent = (imgY / imgDisplayHeight) * 100;

    // 檢查是否在圖片範圍內
    if (xPercent >= 0 && xPercent <= 100 && yPercent >= 0 && yPercent <= 100) {
      return { xPercent, yPercent };
    }

    return null;
  };

  // 開始拖拽大頭釘
  const startDraggingPin = (event: MouseEvent) => {
    if (!isAddingPin.value) return;
    isDraggingPin.value = true;
    updatePinPosition(event);
  };

  // 更新大頭釘位置
  const updatePinPosition = (event: MouseEvent) => {
    if (!isDraggingPin.value || !imageContainer.value) return;

    const rect = imageContainer.value.getBoundingClientRect();
    pinPosition.value = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  };

  // 結束拖拽並保存位置
  const endDraggingPin = async (event: MouseEvent): Promise<boolean> => {
    if (!isDraggingPin.value || !selectedTaskIdForPin.value || !currentFloorPlanKey.value) {
      isDraggingPin.value = false;
      return false;
    }

    const coords = calculatePercentage(event.clientX, event.clientY);
    if (!coords) {
      isDraggingPin.value = false;
      return false;
    }

    const pinLocation: PinLocation = {
      floorPlanKey: currentFloorPlanKey.value,
      xPercent: coords.xPercent,
      yPercent: coords.yPercent,
    };

    try {
      const result = await updateTask(selectedTaskIdForPin.value, {
        pinLocation,
      } as Partial<TaskResponse>);

      if (result.success) {
        isAddingPin.value = false;
        selectedTaskIdForPin.value = null;
        isDraggingPin.value = false;
        return true;
      }
      isDraggingPin.value = false;
      return false;
    } catch (error) {
      console.error('Error saving pin location:', error);
      isDraggingPin.value = false;
      return false;
    }
  };

  // 獲取任務的釘選位置
  const getTaskPinLocation = (taskId: string): PinLocation | null => {
    if (!tasks.value) return null;
    const task = tasks.value.find((t) => t.id === taskId);
    return task?.pinLocation || null;
  };

  // 獲取當前圖片上的所有釘選
  const pinsOnCurrentImage = computed(() => {
    if (!tasks.value || !currentFloorPlanKey.value) return [];

    return tasks.value
      .filter((task) => {
        const pin = task.pinLocation as PinLocation | undefined;
        // 支援新格式（floorPlanKey）和舊格式（floorPlanUrl）
        return pin?.floorPlanKey === currentFloorPlanKey.value;
      })
      .map((task) => ({
        taskId: task.id,
        taskTitle: task.title,
        pinLocation: task.pinLocation as PinLocation,
      }));
  });

  // 計算大頭釘在容器中的像素位置
  const getPinPixelPosition = (pinLoc: PinLocation): { x: number; y: number } | null => {
    if (!imageContainer.value || !floorPlanImg.value) return null;

    const centerX = imageContainer.value.clientWidth / 2;
    const centerY = imageContainer.value.clientHeight / 2;

    const imgDisplayWidth = floorPlanImg.value.naturalWidth * scale.value;
    const imgDisplayHeight = floorPlanImg.value.naturalHeight * scale.value;

    const imgLeft = centerX + translateX.value - imgDisplayWidth / 2;
    const imgTop = centerY + translateY.value - imgDisplayHeight / 2;

    const x = imgLeft + (pinLoc.xPercent / 100) * imgDisplayWidth;
    const y = imgTop + (pinLoc.yPercent / 100) * imgDisplayHeight;

    return { x, y };
  };

  return {
    // 狀態
    isAddingPin,
    selectedTaskIdForPin,
    pinPosition,
    isDraggingPin,

    // 方法
    selectTaskForPin,
    cancelPin,
    startDraggingPin,
    updatePinPosition,
    endDraggingPin,
    getTaskPinLocation,
    getPinPixelPosition,

    // 計算屬性
    pinsOnCurrentImage,
  };
};
