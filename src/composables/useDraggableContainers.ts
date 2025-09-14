import { ref } from 'vue';
import type { ContainerData } from '@/types/project';

export function useDraggableContainers(props: any, emit: any) {
  const containers = ref<ContainerData[]>([]);

  // 初始化容器
  const initializeContainers = () => {
    if (props.constructionContainer && props.constructionContainer.length > 0) {
      containers.value = props.constructionContainer.map((name, index) => ({
        id: `container-${index}`,
        name,
        order: index,
      }));
    }
  };

  // 更新父組件的 constructionContainer
  const updateConstructionContainer = () => {
    // 根據 order 排序
    const sortedContainers = [...containers.value].sort((a, b) => a.order - b.order);
    const containerNames = sortedContainers.map((container) => container.name);
    emit('update:constructionContainer', containerNames);
  };

  // 拖拽相關函數
  const getContainerPayload = (index: number) => {
    return containers.value[index];
  };

  const onContainerDrop = (dropResult: any) => {
    const { removedIndex, addedIndex } = dropResult;

    // 如果沒有移除或添加，則不做任何處理
    if (removedIndex === null && addedIndex === null) return;

    // 如果最後一個元素是「添加新工程類型」按鈕，則不允許拖拽
    if (removedIndex === containers.value.length || addedIndex === containers.value.length) return;

    // 創建新的容器陣列
    const result = [...containers.value];

    // 如果有元素被移除
    let itemToAdd = removedIndex !== null ? result.splice(removedIndex, 1)[0] : null;

    // 如果有元素被添加
    if (addedIndex !== null && itemToAdd) {
      result.splice(addedIndex, 0, itemToAdd);
    }

    // 更新所有容器的順序
    result.forEach((container, index) => {
      container.order = index;
    });

    // 更新容器列表
    containers.value = result;

    // 確保在拖拽操作後立即更新 constructionContainer 陣列
    // 這會觸發父組件中的 updateConstructionContainer 方法，該方法會保存數據到 localStorage
    updateConstructionContainer();
  };

  return {
    containers,
    initializeContainers,
    getContainerPayload,
    onContainerDrop,
    updateConstructionContainer,
  };
}
