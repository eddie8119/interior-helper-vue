import type { DraggableTask } from '@/composables/todo/useDraggableTasks';

/**
 * 根據工程類型過濾任務並排序
 * @param tasks 任務陣列
 * @param constructionId 工程類型ID
 * @returns 過濾並排序後的任務陣列
 */
export function filterTasksByConstruction(
  tasks: DraggableTask[],
  constructionId: number
): DraggableTask[] {
  return tasks
    .filter((task: DraggableTask) => task.constructionType === constructionId)
    .sort((a: DraggableTask, b: DraggableTask) => (a.order ?? 0) - (b.order ?? 0));
}
