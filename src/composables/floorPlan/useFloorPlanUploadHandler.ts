/**
 * 平面圖文件上傳處理 composable
 * 處理文件選擇和拖拽上傳邏輯
 */

export interface UseFloorPlanUploadHandlerOptions {
  onImageAdded: (imageUrl: string) => void;
}

export const useFloorPlanUploadHandler = (options: UseFloorPlanUploadHandlerOptions) => {
  const { onImageAdded } = options;

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
        const imageUrl = await processFile(file);
        onImageAdded(imageUrl);
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
        const imageUrl = await processFile(file);
        onImageAdded(imageUrl);
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
