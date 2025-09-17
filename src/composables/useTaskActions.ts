import type { TaskData } from '@/types/task';
import type { Ref } from 'vue';
import type { CreateTaskSchema } from '@/utils/schemas/createTaskSchema';

export function useTaskActions(
  tasks: Ref<TaskData[]>,
  updateTaskContainer: () => void
) {
    // 添加新任務
    const addNewTask = (newTaskData: CreateTaskSchema) => {
      if (newTaskData) {
        tasks.value.push({
          ...newTaskData,
          id: `task-${Date.now()}`,
          order: tasks.value.length,
        } as TaskData);

        updateTaskContainer();
      }
    };
    
  // 刪除任務
  const deleteTask = (index: number) => {
    tasks.value.splice(index, 1);

    // 重新排序
    tasks.value.forEach((task, idx) => {
      task.order = idx;
    });

    updateTaskContainer();
  };

  // 更新任務
  const updateTask = (index: number, updatedTask: Partial<TaskData>) => {
    // 確保索引有效
    if (index >= 0 && index < tasks.value.length) {
      // 更新任務數據
      tasks.value[index] = {
        ...tasks.value[index],
        ...updatedTask
      };

      // 更新父組件的數據
      updateTaskContainer();
    }
  };

  return {
    addNewTask,
    deleteTask,
    updateTask,
  };
}
