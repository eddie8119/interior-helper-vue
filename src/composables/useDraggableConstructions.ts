import { ref } from 'vue';

import type { ConstructionContainerData } from '@/types/project';

export function useDraggableConstructions(props: any, emit: any) {
  const constructionContainers = ref<ConstructionContainerData[]>([]);

  // 初始化容器
  const initializeConstructionContainers = () => {
    if (props.constructionContainer && props.constructionContainer.length > 0) {
      constructionContainers.value = props.constructionContainer.map(
        (name: string, index: number) => ({
          id: `container-${index}`,
          name,
          order: index,
        })
      );
    }
  };

  // 更新父組件的 constructionContainer
  const updateConstructionContainer = () => {
    // 根據 order 排序
    const sortedContainers = [...constructionContainers.value].sort((a, b) => a.order - b.order);
    const containerNames = sortedContainers.map((container) => container.name);
    emit('update:constructionContainer', containerNames);
  };

  // 拖拽相關函數
  const getConstructionContainerPayload = (index: number) => {
    return constructionContainers.value[index];
  };

  // 拖拽完成後的處理函數
  const onConstructionContainerDrop = (dropResult: any) => {
    const { removedIndex, addedIndex } = dropResult;

    // 如果沒有移除或添加，則不做任何處理
    if (removedIndex === null && addedIndex === null) return;

    // 如果最後一個元素是「添加新工程類型」按鈕，則不允許拖拽
    if (
      removedIndex === constructionContainers.value.length ||
      addedIndex === constructionContainers.value.length
    )
      return;

    // 創建新的容器陣列
    const result = [...constructionContainers.value];

    // 如果有元素被移除
    const itemToAdd = removedIndex !== null ? result.splice(removedIndex, 1)[0] : null;

    // 如果有元素被添加
    if (addedIndex !== null && itemToAdd) {
      result.splice(addedIndex, 0, itemToAdd);
    }

    // 更新所有容器的順序
    result.forEach((container, index) => {
      container.order = index;
    });

    // 更新容器列表
    constructionContainers.value = result;

    // 確保在拖拽操作後立即更新 constructionContainer 陣列
    // 這會觸發父組件中的 updateConstructionContainer 方法，該方法會保存數據到 localStorage
    updateConstructionContainer();
  };

  return {
    constructionContainers,
    initializeConstructionContainers,
    getConstructionContainerPayload,
    onConstructionContainerDrop,
    updateConstructionContainer,
  };
}
