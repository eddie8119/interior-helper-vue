import type { ContainerData } from '@/types/project';
import type { Ref } from 'vue';

export function useConstructionActions(
  containers: Ref<ContainerData[]>,
  updateConstructionContainer: () => void
) {
  // 刪除容器
  const deleteConstruction = (index: number) => {
    containers.value.splice(index, 1);

    // 重新排序
    containers.value.forEach((container: ContainerData, idx: number) => {
      container.order = idx;
    });

    updateConstructionContainer();
  };

  // 添加新容器
  const addNewConstruction = (newContainerName: string) => {
    if (newContainerName && newContainerName.trim()) {
      containers.value.push({
        id: `container-${Date.now()}`,
        name: newContainerName.trim(),
        order: containers.value.length,
      });
      updateConstructionContainer();
    }
  };

  // 更新容器名稱
  const updateConstructionName = (index: number, newName: string) => {
    // 確保索引有效
    if (index >= 0 && index < containers.value.length) {
      // 更新容器名稱
      containers.value[index].name = newName;

      // 更新父組件的數據
      updateConstructionContainer();
    }
  };

  return {
    deleteConstruction,
    addNewConstruction,
    updateConstructionName,
  };
}
