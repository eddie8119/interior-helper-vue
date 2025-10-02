import type { TaskResponse } from '@/types/response';
import type { CreateTaskSchema } from '@/utils/schemas/createTaskSchema';
import type { Ref } from 'vue';

export function useTaskActions(
  tasksRef: Ref<TaskResponse[]>,
  updateCallback: (newTasks: TaskResponse[]) => void
) {
  // 添加新任務
  const addNewTask = (newTaskData: CreateTaskSchema) => {
    if (newTaskData) {
      tasksRef.value.push({
        ...newTaskData,
        id: Date.now().toString(),
        createdAt: new Date().toString(),
        updatedAt: new Date().toString(),
      } as TaskResponse);

      updateCallback(tasksRef.value);
    }
  };

  // 刪除任務
  const deleteTask = (index: number) => {
    tasksRef.value.splice(index, 1);

    updateCallback(tasksRef.value);
  };

  // 更新任務
  const updateTask = (index: number, updatedTask: Partial<TaskData>) => {
    // 確保索引有效
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
