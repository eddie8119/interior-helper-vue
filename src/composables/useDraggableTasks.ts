import { ref } from 'vue';

import type { TaskData } from '@/types/task';

export function useDraggableTasks(props: any, emit: any) {
  const tasks = ref<TaskData[]>([]);

  // 初始化任務
  const initializeTask = () => {
    if (props.task && props.task.length > 0) {
      tasks.value = props.task.map((task: Partial<TaskData>, index: number) => ({
        id: `task-${index}`,
        ...task,
        order: index,
      }));
    }
  };

  // 更新父組件的 task
  const updateTask = () => {
    // 根據 order 排序
    const sortedtasks = [...tasks.value].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    emit('update:task', sortedtasks);
  };

  // 拖拽相關函數
  const getTaskPayload = (index: number) => {
    return tasks.value[index];
  };

  const onTaskDrop = (dropResult: any) => {
    const { removedIndex, addedIndex } = dropResult;

    // 如果沒有移除或添加，則不做任何處理
    if (removedIndex === null && addedIndex === null) return;

    // 如果最後一個元素是「添加新工程類型」按鈕，則不允許拖拽
    if (removedIndex === tasks.value.length || addedIndex === tasks.value.length) return;

    // 創建新的容器陣列
    const result = [...tasks.value];

    // 如果有元素被移除
    const itemToAdd = removedIndex !== null ? result.splice(removedIndex, 1)[0] : null;

    // 如果有元素被添加
    if (addedIndex !== null && itemToAdd) {
      result.splice(addedIndex, 0, itemToAdd);
    }

    // 更新所有任務的順序
    result.forEach((task, index) => {
      task.order = index;
    });

    // 更新任務列表
    tasks.value = result;

    // 確保在拖拽操作後立即更新 task 陣列
    // 這會觸發父組件中的 updateTask 方法，該方法會保存數據到 localStorage
    updateTask();
  };

  return {
    tasks,
    initializeTask,
    getTaskPayload,
    onTaskDrop,
    updateTask,
  };
}
