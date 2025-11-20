/**
 * 平面圖上傳功能
 * 處理檔案選擇、驗證、轉換和資料庫更新
 */

import { ElMessage } from 'element-plus';
import { ref } from 'vue';

import type { CreateProjectSchema } from '@/utils/schemas/createProjectSchema';

import { isValidImageFile, processImageFile } from '@/utils/floorPlan/floorPlanImage';

export interface UseFloorPlanUploadOptions {
  updateProject: (data: Partial<CreateProjectSchema>) => Promise<unknown>;
}

export const useFloorPlanUpload = (options: UseFloorPlanUploadOptions) => {
  const { updateProject } = options;

  const fileInput = ref<HTMLInputElement>();
  const isUploadingFloorPlan = ref(false);

  const triggerFileInput = () => {
    fileInput.value?.click();
  };

  const handleFileSelect = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const files = target.files;
    if (files) {
      await uploadFloorPlanImages(Array.from(files));
    }
  };

  const handleFileDrop = async (event: DragEvent) => {
    const files = event.dataTransfer?.files;
    if (files) {
      await uploadFloorPlanImages(Array.from(files));
    }
  };

  const uploadFloorPlanImages = async (files: File[]) => {
    isUploadingFloorPlan.value = true;
    try {
      const imageUrls: string[] = [];

      for (const file of files) {
        if (!isValidImageFile(file)) {
          ElMessage.error(`檔案 ${file.name} 不是有效的圖片格式`);
          continue;
        }

        try {
          const imageUrl = await processImageFile(file);
          imageUrls.push(imageUrl);
        } catch (error) {
          ElMessage.error(`處理圖片 ${file.name} 失敗`);
          console.error('Failed to process image:', error);
        }
      }

      if (imageUrls.length > 0) {
        // 更新專案的 floorPlanUrls
        await updateProject({
          floorPlanUrls: imageUrls,
        });
        ElMessage.success(`成功上傳 ${imageUrls.length} 張平面圖`);
      }
    } catch (error) {
      ElMessage.error('上傳平面圖失敗');
      console.error('Failed to upload floor plan images:', error);
    } finally {
      isUploadingFloorPlan.value = false;
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    }
  };

  const resetFloorPlan = () => {
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  };

  return {
    fileInput,
    isUploadingFloorPlan,
    triggerFileInput,
    handleFileSelect,
    handleFileDrop,
    uploadFloorPlanImages,
    resetFloorPlan,
  };
};
