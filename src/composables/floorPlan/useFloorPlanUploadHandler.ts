/**
 * 平面圖文件上傳處理 composable
 * 處理文件選擇和拖拽上傳邏輯
 */

import type { FloorPlanItem } from '@/types/response';

export interface UseFloorPlanUploadHandlerOptions {
  onImageAdded: (image: FloorPlanItem) => Promise<void> | void;
}

export const useFloorPlanUploadHandler = (options: UseFloorPlanUploadHandlerOptions) => {
  const { onImageAdded } = options;

  // 生成唯一的 key
  const generateFloorPlanKey = (): string => {
    return crypto.randomUUID();
  };

  // 處理文件轉換為 base64
  const processFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        resolve(result);
      };
      reader.onerror = () => {
        reject(new Error(`Failed to read file: ${file.name}`));
      };
      reader.readAsDataURL(file);
    });
  };

  // 處理文件選擇事件
  const handleFileSelect = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      try {
        const data = await processFile(file);
        const floorPlanItem: FloorPlanItem = {
          key: generateFloorPlanKey(),
          data,
        };
        await onImageAdded(floorPlanItem);
      } catch (error) {
        console.error('Error processing file:', error);
      }
    }
  };

  // 處理文件拖拽事件
  const handleFileDrop = async (event: DragEvent) => {
    const file = event.dataTransfer?.files[0];
    if (file) {
      try {
        const data = await processFile(file);
        const floorPlanItem: FloorPlanItem = {
          key: generateFloorPlanKey(),
          data,
        };
        await onImageAdded(floorPlanItem);
      } catch (error) {
        console.error('Error processing file:', error);
      }
    }
  };

  return {
    handleFileSelect,
    handleFileDrop,
  };
};
