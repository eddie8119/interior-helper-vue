import type { DraggableTask } from '@/composables/todo/useDraggableTasks';

/**
 * 根據工程類型過濾任務並排序
 * @param tasks 任務陣列
 * @param constructionId 工程類型ID
 * @returns 過濾並排序後的任務陣列
 */
export function filterTasksByConstruction(
  tasks: DraggableTask[],
  constructionId: string
): DraggableTask[] {
  return tasks
    .filter((task: DraggableTask) => task.constructionType === constructionId)
    .sort((a: DraggableTask, b: DraggableTask) => (a.order ?? 0) - (b.order ?? 0));
}

/**
 * 處理任務排序
 * 將任務按工程類型分組，並為每組內的任務分配順序號
 *
 * @param tasks - 原始任務陣列
 * @returns 處理後的任務陣列
 */
export function processTasksWithOrder(tasks: DraggableTask[] | null): DraggableTask[] {
  if (!tasks || tasks.length === 0) {
    return [];
  }

  // 使用 Map 進行分組，性能更好
  const taskMap = new Map<string, DraggableTask[]>();

  // 按工程類型分組（不修改原始任務，建立淺拷貝，材料也拷貝）
  tasks.forEach((task) => {
    const clonedTask: DraggableTask = {
      ...task,
      materials: Array.isArray(task.materials)
        ? task.materials.map((m) => ({ ...m }))
        : task.materials,
    };

    const constructionType = clonedTask.constructionType || 'uncategorized';

    if (!taskMap.has(constructionType)) {
      taskMap.set(constructionType, []);
    }

    const group = taskMap.get(constructionType);
    if (group) {
      group.push(clonedTask);
    }
  });

  // 對每組任務排序並分配 order（只修改拷貝）
  const processedTasks: DraggableTask[] = [];

  taskMap.forEach((group) => {
    group
      .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity))
      .forEach((task, index) => {
        task.order = index;
        processedTasks.push(task);
      });
  });

  return processedTasks;
}

/**
 * 重新計算所有任務的 order
 * 用於拖放操作後重新排序
 *
 * @param tasks - 任務陣列
 */
export function reorderAllTasks(tasks: DraggableTask[]): void {
  const containerMap = new Map<string, DraggableTask[]>();

  tasks.forEach((task) => {
    const type = task.constructionType || 'uncategorized';

    if (!containerMap.has(type)) {
      containerMap.set(type, []);
    }

    const group = containerMap.get(type);
    if (group) {
      group.push(task);
    }
  });

  containerMap.forEach((group) => {
    group.forEach((task, index) => {
      task.order = index;
    });
  });
}
