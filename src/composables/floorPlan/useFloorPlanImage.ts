/**
 * 平面圖圖片管理 composable
 * 處理圖片上傳、切換、重置等邏輯
 */

import { computed, ref, type Ref, watch } from 'vue';

import type { CreateProjectSchema } from '@/utils/schemas/createProjectSchema';

export interface UseFloorPlanImageOptions {
  floorPlanUrls: Ref<string[]>;
  updateProject: (data: Partial<CreateProjectSchema>) => Promise<unknown>;
  onResetComplete?: () => void;
}

export const useFloorPlanImage = (options: UseFloorPlanImageOptions) => {
  const { floorPlanUrls, updateProject, onResetComplete } = options;

  // 圖片管理狀態
  const currentImageIndex = ref(0);
  const uploadedImages = ref<string[]>([]);
  const isResettingFloorPlan = ref(false);

  // 合併專案中的圖片和新上傳的圖片
  const allFloorPlanUrls = computed(() => {
    return [...floorPlanUrls.value, ...uploadedImages.value];
  });

  // 當前顯示的圖片
  const currentFloorPlanImage = computed(() => {
    return allFloorPlanUrls.value[currentImageIndex.value] || '';
  });

  // 圖片切換功能
  const prevImage = () => {
    if (currentImageIndex.value > 0) {
      currentImageIndex.value--;
    }
  };

  const nextImage = () => {
    if (currentImageIndex.value < allFloorPlanUrls.value.length - 1) {
      currentImageIndex.value++;
    }
  };

  // 監聽 floorPlanUrls 變化，重置索引
  watch(
    floorPlanUrls,
    () => {
      currentImageIndex.value = 0;
    },
    { immediate: true }
  );

  // 添加上傳的圖片
  const addUploadedImage = (imageUrl: string) => {
    uploadedImages.value.push(imageUrl);
    currentImageIndex.value = allFloorPlanUrls.value.length - 1;
  };

  // 重置功能 - 顯示確認對話框
  const resetFloorPlan = () => {
    isResettingFloorPlan.value = true;
  };

  // 確認重置
  const confirmResetFloorPlan = async () => {
    try {
      // 清空新上傳的圖片
      uploadedImages.value = [];
      currentImageIndex.value = 0;

      // 清空資料庫中的 floorPlanUrls
      await updateProject({ floorPlanUrls: [] });

      isResettingFloorPlan.value = false;
      onResetComplete?.();
    } catch (error) {
      console.error('Error resetting floor plan:', error);
      isResettingFloorPlan.value = false;
    }
  };

  // 取消重置
  const cancelResetFloorPlan = () => {
    isResettingFloorPlan.value = false;
  };

  return {
    // 狀態
    currentImageIndex,
    uploadedImages,
    isResettingFloorPlan,
    allFloorPlanUrls,
    currentFloorPlanImage,

    // 方法
    prevImage,
    nextImage,
    addUploadedImage,
    resetFloorPlan,
    confirmResetFloorPlan,
    cancelResetFloorPlan,
  };
};
