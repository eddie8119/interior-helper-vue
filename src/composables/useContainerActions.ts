import type { Ref } from 'vue';
import type { ContainerData } from '@/types/project';

export function useContainerActions(
  containers: Ref<ContainerData[]>,
  updateConstructionContainer: () => void
) {
  // 判斷是否為默認容器（不可刪除）
  const isDefaultContainer = (index: number) => {
    return containers.value ? index < (containers.value.length || 0) : false;
  };

  // 刪除容器
  const deleteContainer = (index: number) => {
    if (isDefaultContainer(index)) return;

    containers.value.splice(index, 1);

    // 重新排序
    containers.value.forEach((container: ContainerData, idx: number) => {
      container.order = idx;
    });

    updateConstructionContainer();
  };

  // 添加新容器
  const addNewContainer = (newContainerName: string) => {
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
  const updateContainerName = (index: number, newName: string) => {
    // 確保索引有效
    if (index >= 0 && index < containers.value.length) {
      // 更新容器名稱
      containers.value[index].name = newName;

      // 更新父組件的數據
      updateConstructionContainer();
    }
  };

  return {
    deleteContainer,
    addNewContainer,
    updateContainerName,
  };
}
