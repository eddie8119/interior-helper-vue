import type { ConstructionSelection } from '@/types/selection';
import type { Ref } from 'vue';

export function useConstructionActions(
  containersRef: Ref<ConstructionSelection[]>,
  updateCallback: (newContainers: ConstructionSelection[]) => void
) {
  // 刪除容器
  const deleteConstruction = (index: number) => {
    containersRef.value = containersRef.value.filter((_, i) => i !== index);
    updateCallback(containersRef.value);
  };

  // 添加新容器
  const addNewConstruction = (newContainerName: string) => {
    if (newContainerName && newContainerName.trim()) {
      containersRef.value = [
        ...containersRef.value,
        {
          id: Date.now().toString(),
          name: newContainerName.trim(),
        },
      ];
      updateCallback(containersRef.value);
    }
  };

  // 更新容器名稱
  const updateConstructionName = (index: number, newName: string) => {
    if (index >= 0 && index < containersRef.value.length) {
      containersRef.value = containersRef.value.map((container, i) =>
        i === index ? { ...container, name: newName } : container
      );
      updateCallback(containersRef.value);
    }
  };

  return {
    deleteConstruction,
    addNewConstruction,
    updateConstructionName,
  };
}
