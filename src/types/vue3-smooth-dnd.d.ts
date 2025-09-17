declare module 'vue3-smooth-dnd' {
  import { DefineComponent } from 'vue';

  export const Container: DefineComponent<{
    orientation?: string;
    behaviour?: string;
    tag?: string;
    groupName?: string;
    lockAxis?: string;
    dragHandleSelector?: string;
    nonDragAreaSelector?: string;
    dragBeginDelay?: number;
    animationDuration?: number;
    autoScrollEnabled?: boolean;
    dragClass?: string;
    dropClass?: string;
    removeOnDropOut?: boolean;
    getChildPayload?: (index: number) => any;
    shouldAnimateDrop?: (sourceContainerOptions: any, payload: any) => boolean;
    shouldAcceptDrop?: (sourceContainerOptions: any, payload: any) => boolean;
    getGhostParent?: () => HTMLElement;
  }>;

  export const Draggable: DefineComponent<{
    tag?: string;
  }>;

  export interface DropResult {
    addedIndex: number | null;
    removedIndex: number | null;
    payload?: any;
    element?: HTMLElement;
  }
}
