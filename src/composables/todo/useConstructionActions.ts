import type { Ref } from 'vue';

import type { ConstructionContainer } from './useDraggableConstructions';

export function useConstructionActions(
  containersRef: Ref<ConstructionContainer[]>,
  updateCallback: (newContainers: ConstructionContainer[]) => void
) {
  // 刪除容器
  const deleteConstruction = (index: number) => {
    containersRef.value.splice(index, 1);
    updateCallback(containersRef.value);
  };

  // 添加新容器
  const addNewConstruction = (newContainerName: string) => {
    if (newContainerName && newContainerName.trim()) {
      containersRef.value.push({
        id: `container-${Date.now()}`,
        name: newContainerName.trim(),
      });
      updateCallback(containersRef.value);
    }
  };

  // 更新容器名稱
  const updateConstructionName = (index: number, newName: string) => {
    if (index >= 0 && index < containersRef.value.length) {
      containersRef.value[index].name = newName;
      updateCallback(containersRef.value);
    }
  };

  return {
    deleteConstruction,
    addNewConstruction,
    updateConstructionName,
  };
}
