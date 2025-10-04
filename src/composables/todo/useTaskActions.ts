import type { TaskResponse } from '@/types/response';
import type { Ref } from 'vue';

export function useTaskActions(
  tasksRef: Ref<TaskResponse[]>,
  updateCallback: (newTasks: TaskResponse[]) => void
) {
  // 添加新任務
  const addNewTask = (newTaskData: Partial<TaskResponse>) => {
    if (newTaskData) {
      tasksRef.value.push({
        ...newTaskData,
        id: Date.now().toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      } as TaskResponse);

      updateCallback(tasksRef.value);
    }
  };

  // 刪除任務
  const deleteTask = (id: string) => {
    tasksRef.value = tasksRef.value.filter((task) => task.id !== id);

    updateCallback(tasksRef.value);
  };

  // 更新任務
  const updateTask = (id: string, updatedTask: Partial<TaskResponse>) => {
    // 確保索引有效
    const index = tasksRef.value.findIndex((task) => task.id === id);
    if (index >= 0 && index < tasksRef.value.length) {
      // 更新任務數據
      tasksRef.value[index] = {
        ...tasksRef.value[index],
        ...updatedTask,
      };

      // 更新父組件的數據
      updateCallback(tasksRef.value);
    }
  };

  return {
    addNewTask,
    deleteTask,
    updateTask,
  };
}
