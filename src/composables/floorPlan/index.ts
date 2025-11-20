/**
 * 平面圖功能的組合式函數
 * 整合圖片上傳、縮放、平移和標記點功能
 */

import { type Ref } from 'vue';

import { useFloorPlanDrag } from './useFloorPlanDrag';
import { useFloorPlanMarker } from './useFloorPlanMarker';
import { useFloorPlanUpload } from './useFloorPlanUpload';
import { useFloorPlanZoom } from './useFloorPlanZoom';

import type { CreateProjectSchema } from '@/utils/schemas/createProjectSchema';

export interface UseFloorPlanOptions {
  imageContainer: Ref<HTMLDivElement | undefined>;
  floorPlanImg: Ref<HTMLImageElement | undefined>;
  projectId: string;
  updateProject: (data: Partial<CreateProjectSchema>) => Promise<unknown>;
}

export const useFloorPlan = (options: UseFloorPlanOptions) => {
  const { imageContainer, floorPlanImg, updateProject } = options;

  // 圖片上傳功能
  const uploadFeatures = useFloorPlanUpload({
    updateProject,
  });

  // 縮放和平移功能
  const zoomFeatures = useFloorPlanZoom({
    imageContainer,
    floorPlanImg,
  });

  // 拖拽功能
  const dragFeatures = useFloorPlanDrag({
    translateX: zoomFeatures.translateX,
    translateY: zoomFeatures.translateY,
  });

  // 標記點功能
  const markerFeatures = useFloorPlanMarker({
    imageContainer,
    floorPlanImg,
    scale: zoomFeatures.scale,
    translateX: zoomFeatures.translateX,
    translateY: zoomFeatures.translateY,
  });

  return {
    // 圖片上傳
    ...uploadFeatures,

    // 縮放和平移
    ...zoomFeatures,

    // 拖拽
    ...dragFeatures,

    // 標記點
    ...markerFeatures,
  };
};
