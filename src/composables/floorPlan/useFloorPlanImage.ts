/**
 * 平面圖圖片管理 composable
 * 處理圖片上傳、切換、重置等邏輯
 */

import { computed, ref, type Ref, watch } from 'vue';

import type { FloorPlanItem } from '@/types/response';
import type { CreateProjectSchema } from '@/utils/schemas/createProjectSchema';

export interface UseFloorPlanImageOptions {
  floorPlanUrls: Ref<FloorPlanItem[]>;
  updateProject: (data: Partial<CreateProjectSchema>) => Promise<unknown>;
  onResetComplete?: () => void;
}

/**
 * 提取圖片資料 (data URL)
 */
const extractImageData = (item: FloorPlanItem): string => {
  return item.data;
};

export const useFloorPlanImage = (options: UseFloorPlanImageOptions) => {
  const { floorPlanUrls, updateProject, onResetComplete } = options;

  // 圖片管理狀態
  const currentImageIndex = ref(0);
  const uploadedImages = ref<FloorPlanItem[]>([]);
  const isResettingFloorPlan = ref(false);

  // 合併專案中的圖片和新上傳的圖片
  const allFloorPlanUrls = computed<FloorPlanItem[]>(() => {
    return [...floorPlanUrls.value, ...uploadedImages.value];
  });

  // 當前顯示的圖片 (提取 data URL)
  const currentFloorPlanImage = computed(() => {
    const item = allFloorPlanUrls.value[currentImageIndex.value];
    return item ? extractImageData(item) : '';
  });

  // 當前圖片的 key (用於釘選)
  const currentFloorPlanKey = computed(() => {
    const item = allFloorPlanUrls.value[currentImageIndex.value];
    return item ? item.key : '';
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
    (newValue) => {
      currentImageIndex.value = 0;
      uploadedImages.value = uploadedImages.value.filter((uploaded) => {
        return !newValue.some((existing) => existing.key === uploaded.key);
      });
    },
    { immediate: true }
  );

  // 添加上傳的圖片
  const addUploadedImage = async (image: FloorPlanItem): Promise<void> => {
    uploadedImages.value.push(image);
    currentImageIndex.value = allFloorPlanUrls.value.length - 1;

    try {
      const persistedItems = [...floorPlanUrls.value, ...uploadedImages.value];
      await updateProject({ floorPlanUrls: persistedItems });
    } catch (error) {
      uploadedImages.value = uploadedImages.value.filter((item) => item.key !== image.key);
      if (allFloorPlanUrls.value.length === 0) {
        currentImageIndex.value = 0;
      } else {
        currentImageIndex.value = Math.max(0, allFloorPlanUrls.value.length - 1);
      }
      throw error;
    }
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

      await updateProject({ floorPlanUrls: null });

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
    currentFloorPlanKey,

    // 方法
    prevImage,
    nextImage,
    addUploadedImage,
    resetFloorPlan,
    confirmResetFloorPlan,
    cancelResetFloorPlan,
  };
};
