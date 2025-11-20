/**
 * 平面圖功能的組合式函數
 * 整合圖片上傳、縮放、平移和標記點功能
 */

import { computed, ref, type Ref } from 'vue';

import {
  calculateInitialScale,
  type ImageDimensions,
  isValidImageFile,
  processImageFile,
} from '@/utils/floorPlan/floorPlanImage';
import {
  calculateMarkerStyle,
  type ClickToMarkerParams,
  convertClickToMarkerCoordinates,
  createNewMarker,
  deleteMarker,
  findMarker,
  type MarkerPositionParams,
  type TaskMarker,
  updateMarker,
} from '@/utils/floorPlan/floorPlanMarker';
import {
  calculateDragMove,
  calculateWheelZoom,
  type DragMoveParams,
  resetZoomState,
  type WheelZoomParams,
} from '@/utils/floorPlan/floorPlanZoom';

export interface UseFloorPlanOptions {
  imageContainer: Ref<HTMLDivElement | undefined>;
  floorPlanImg: Ref<HTMLImageElement | undefined>;
}

export const useFloorPlan = (options: UseFloorPlanOptions) => {
  const { imageContainer, floorPlanImg } = options;

  // ========== 圖片上傳相關 ==========
  const fileInput = ref<HTMLInputElement>();
  const floorPlanImage = ref<string>('');

  const triggerFileInput = () => {
    fileInput.value?.click();
  };

  const handleFileSelect = async (event: Event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file && isValidImageFile(file)) {
      try {
        floorPlanImage.value = await processImageFile(file);
      } catch (error) {
        console.error('Failed to process image:', error);
      }
    }
  };

  const handleFileDrop = async (event: DragEvent) => {
    const file = event.dataTransfer?.files[0];
    if (file && isValidImageFile(file)) {
      try {
        floorPlanImage.value = await processImageFile(file);
      } catch (error) {
        console.error('Failed to process image:', error);
      }
    }
  };

  const resetFloorPlan = () => {
    floorPlanImage.value = '';
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  };

  // ========== 縮放和平移相關 ==========
  const scale = ref(1);
  const translateX = ref(0);
  const translateY = ref(0);
  const initialScale = ref(1);
  const imageLoaded = ref(false);

  const imageStyle = computed(() => ({
    transform: `translate(${translateX.value}px, ${translateY.value}px) scale(${scale.value})`,
    transformOrigin: 'center center',
  }));

  const handleImageLoad = () => {
    if (!floorPlanImg.value || !imageContainer.value) return;

    const img = floorPlanImg.value;
    const container = imageContainer.value;

    const dimensions: ImageDimensions = {
      containerWidth: container.clientWidth,
      containerHeight: container.clientHeight,
      imageWidth: img.naturalWidth,
      imageHeight: img.naturalHeight,
    };

    const { initialScale: calculatedScale } = calculateInitialScale(dimensions);
    initialScale.value = calculatedScale;

    scale.value = calculatedScale;
    translateX.value = 0;
    translateY.value = 0;

    imageLoaded.value = true;
  };

  const resetZoom = () => {
    const zoomState = resetZoomState(initialScale.value);
    scale.value = zoomState.scale;
    translateX.value = zoomState.translateX;
    translateY.value = zoomState.translateY;
  };

  // ========== 拖拽相關 ==========
  const isDragging = ref(false);
  const dragStartX = ref(0);
  const dragStartY = ref(0);
  const dragStartTranslateX = ref(0);
  const dragStartTranslateY = ref(0);

  const handleMouseDown = (event: MouseEvent, isAddingMarker: boolean) => {
    if (isAddingMarker) return;

    isDragging.value = true;
    dragStartX.value = event.clientX;
    dragStartY.value = event.clientY;
    dragStartTranslateX.value = translateX.value;
    dragStartTranslateY.value = translateY.value;
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (!isDragging.value) return;

    const params: DragMoveParams = {
      event,
      dragStartX: dragStartX.value,
      dragStartY: dragStartY.value,
      dragStartTranslateX: dragStartTranslateX.value,
      dragStartTranslateY: dragStartTranslateY.value,
    };

    const { translateX: newTranslateX, translateY: newTranslateY } = calculateDragMove(params);
    translateX.value = newTranslateX;
    translateY.value = newTranslateY;
  };

  const handleMouseUp = () => {
    isDragging.value = false;
  };

  const handleWheel = (event: WheelEvent) => {
    if (!imageContainer.value) return;

    const params: WheelZoomParams = {
      event,
      currentScale: scale.value,
      containerWidth: imageContainer.value.clientWidth,
      containerHeight: imageContainer.value.clientHeight,
      currentTranslateX: translateX.value,
      currentTranslateY: translateY.value,
    };

    const { newScale, newTranslateX, newTranslateY } = calculateWheelZoom(params);
    scale.value = newScale;
    translateX.value = newTranslateX;
    translateY.value = newTranslateY;
  };

  // ========== 標記點相關 ==========
  const taskMarkers = ref<TaskMarker[]>([]);
  const isAddingMarker = ref(false);
  const selectedMarkerId = ref<string | null>(null);

  const toggleAddMarker = () => {
    isAddingMarker.value = !isAddingMarker.value;
    selectedMarkerId.value = null;
  };

  const getMarkerStyle = (marker: TaskMarker) => {
    if (!floorPlanImg.value || !imageContainer.value) return {};

    const img = floorPlanImg.value;
    const container = imageContainer.value;

    const params: MarkerPositionParams = {
      markerX: marker.x,
      markerY: marker.y,
      imageWidth: img.naturalWidth,
      imageHeight: img.naturalHeight,
      scale: scale.value,
      translateX: translateX.value,
      translateY: translateY.value,
      containerWidth: container.clientWidth,
      containerHeight: container.clientHeight,
    };

    return calculateMarkerStyle(params);
  };

  const handleImageClick = (event: MouseEvent) => {
    if (!isAddingMarker.value || !floorPlanImg.value || !imageContainer.value) return;

    event.stopPropagation();

    const img = floorPlanImg.value;
    const container = imageContainer.value;
    const rect = container.getBoundingClientRect();

    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const params: ClickToMarkerParams = {
      clickX,
      clickY,
      imageWidth: img.naturalWidth,
      imageHeight: img.naturalHeight,
      scale: scale.value,
      translateX: translateX.value,
      translateY: translateY.value,
      containerWidth: container.clientWidth,
      containerHeight: container.clientHeight,
    };

    const { relativeX, relativeY, isValid } = convertClickToMarkerCoordinates(params);

    if (isValid) {
      createMarker(relativeX, relativeY);
    }
  };

  const handleContainerClick = (event: MouseEvent) => {
    if (isAddingMarker.value) {
      event.stopPropagation();
    } else {
      selectedMarkerId.value = null;
    }
  };

  const createMarker = (x: number, y: number) => {
    // eslint-disable-next-line no-alert
    const title = prompt('請輸入任務標題：');
    if (!title) return;

    // eslint-disable-next-line no-alert
    const description = prompt('請輸入任務描述（可選）：') || undefined;

    const newMarker = createNewMarker(x, y, title, description);
    taskMarkers.value.push(newMarker);
    isAddingMarker.value = false;
    selectedMarkerId.value = newMarker.id;
  };

  const selectMarker = (markerId: string) => {
    selectedMarkerId.value = selectedMarkerId.value === markerId ? null : markerId;
  };

  const editMarker = (markerId: string) => {
    const marker = findMarker(taskMarkers.value, markerId);
    if (!marker) return;

    // eslint-disable-next-line no-alert
    const newTitle = prompt('請輸入新的任務標題：', marker.title);
    if (newTitle === null) return;

    // eslint-disable-next-line no-alert
    const newDescription = prompt('請輸入新的任務描述：', marker.description || '');

    const updatedMarker = updateMarker(marker, {
      title: newTitle,
      description: newDescription || undefined,
    });

    const index = taskMarkers.value.findIndex((m) => m.id === markerId);
    if (index > -1) {
      taskMarkers.value[index] = updatedMarker;
    }
  };

  const deleteMarkerById = (markerId: string) => {
    // eslint-disable-next-line no-alert
    if (confirm('確定要刪除這個任務標記嗎？')) {
      taskMarkers.value = deleteMarker(taskMarkers.value, markerId);
      selectedMarkerId.value = null;
    }
  };

  return {
    // 圖片上傳
    fileInput,
    floorPlanImage,
    triggerFileInput,
    handleFileSelect,
    handleFileDrop,
    resetFloorPlan,

    // 縮放和平移
    scale,
    translateX,
    translateY,
    initialScale,
    imageLoaded,
    imageStyle,
    handleImageLoad,
    resetZoom,

    // 拖拽
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleWheel,

    // 標記點
    taskMarkers,
    isAddingMarker,
    selectedMarkerId,
    toggleAddMarker,
    getMarkerStyle,
    handleImageClick,
    handleContainerClick,
    createMarker,
    selectMarker,
    editMarker,
    deleteMarkerById,
  };
};
