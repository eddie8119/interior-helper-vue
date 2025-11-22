import type { Ref } from 'vue';

export interface PinLocation {
  floorPlanKey: string;
  xPercent: number;
  yPercent: number;
}

export interface PinSelectionState {
  isAddingPin: Ref<boolean>;
  selectedTaskIdForPin: Ref<string | null>;
}
