/**
 * 平面圖圖片上傳和處理相關功能
 */

export const processImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      resolve(result);
    };
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    reader.readAsDataURL(file);
  });
};

export interface ImageDimensions {
  containerWidth: number;
  containerHeight: number;
  imageWidth: number;
  imageHeight: number;
}

export interface ScaleResult {
  initialScale: number;
}

/**
 * 計算圖片適應螢幕的初始縮放比例
 */
export const calculateInitialScale = (dimensions: ImageDimensions): ScaleResult => {
  const { containerWidth, containerHeight, imageWidth, imageHeight } = dimensions;

  const scaleX = containerWidth / imageWidth;
  const scaleY = containerHeight / imageHeight;

  // 選擇較小的縮放比例以確保圖片完全顯示
  const initialScale = Math.min(scaleX, scaleY, 1);

  return { initialScale };
};

/**
 * 驗證檔案是否為有效的圖片格式
 */
export const isValidImageFile = (file: File): boolean => {
  return file.type.startsWith('image/');
};
