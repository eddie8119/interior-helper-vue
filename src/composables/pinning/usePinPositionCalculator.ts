import type { PinLocation } from '@/types/pinTypes';
import type { Ref } from 'vue';

export interface UsePinPositionCalculatorOptions {
  imageContainer: Ref<HTMLDivElement | undefined>;
  floorPlanImg: Ref<HTMLImageElement | undefined>;
  scale: Ref<number>;
  translateX: Ref<number>;
  translateY: Ref<number>;
}

export const usePinPositionCalculator = ({
  imageContainer,
  floorPlanImg,
  scale,
  translateX,
  translateY,
}: UsePinPositionCalculatorOptions) => {
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

    if (xPercent >= 0 && xPercent <= 100 && yPercent >= 0 && yPercent <= 100) {
      return { xPercent, yPercent };
    }

    return null;
  };

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
    calculatePercentage,
    getPinPixelPosition,
  };
};
