import type { Ref } from 'vue';

export interface ConstructionContainer {
  id: string;
  name: string;
}

/**
 * @composable useDraggableConstructions
 *
 * @description
 * 負責處理工程類型容器的拖曳排序功能。
 *
 * @param {Ref<ConstructionContainer[]>} containersRef - 容器陣列的響應式引用。
 * @param {(newContainers: ConstructionContainer[]) => void} updateCallback - 數據更新後的回調函數。
 *
 * @returns {
 *   getConstructionContainerPayload: (index: number) => ConstructionContainer;
 *   onConstructionContainerDrop: (dropResult: any) => void;
 * }
 */
export function useDraggableConstructions(
  containersRef: Ref<ConstructionContainer[]>,
  updateCallback: (newContainers: ConstructionContainer[]) => void
) {
  const getConstructionContainerPayload = (index: number): ConstructionContainer => {
    return containersRef.value[index];
  };

  const onConstructionContainerDrop = (dropResult: any) => {
    const { removedIndex, addedIndex, payload } = dropResult;
    if (removedIndex === null && addedIndex === null) return;

    const newContainers = [...containersRef.value];
    let itemToAdd = payload;

    if (removedIndex !== null) {
      itemToAdd = newContainers.splice(removedIndex, 1)[0];
    }

    if (addedIndex !== null) {
      newContainers.splice(addedIndex, 0, itemToAdd);
    }

    containersRef.value = newContainers;
    updateCallback(newContainers);
  };

  return {
    getConstructionContainerPayload,
    onConstructionContainerDrop,
  };
}
