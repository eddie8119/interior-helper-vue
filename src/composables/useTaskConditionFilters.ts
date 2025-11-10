/**
 * 用於過濾任務。
 *
 * @param tasksData - 任務列表
 */
import { computed, ref, type Ref } from 'vue';

import type { TaskFilterStatus } from '@/constants/selection';
import type { TaskResponse } from '@/types/response';

import { isWithinDays } from '@/utils/date';
import { filterTasksByConstruction as filterByConstructionUtil } from '@/utils/todo/taskUtils';

export function useTaskConditionFilters(tasksData: Ref<TaskResponse[]>) {
  const selectedStatus = ref<TaskFilterStatus>('all');
  const daysRange = ref<[number, number] | null>(null);

  // 日期過濾
  const filteredTasksByDate = computed(() => {
    if (!daysRange.value) return tasksData.value;
    const [min, max] = daysRange.value;
    return tasksData.value.filter((task) => {
      if (!task.endDateTime) return false;
      return isWithinDays(task.endDateTime, min, max);
    });
  });

  // 任務執行狀態過濾
  const filteredTasksByStatus = computed(() => {
    if (selectedStatus.value === 'all') return filteredTasksByDate.value;
    return filteredTasksByDate.value.filter((task) => task.status === selectedStatus.value);
  });

  // 這適用於將任務歸類到對應的工程容器
  const filteredTasksByConstruction = (constructionId: string) => {
    return filterByConstructionUtil(filteredTasksByStatus.value, constructionId);
  };

  return {
    selectedStatus,
    daysRange,
    filteredTasksByStatus,
    filteredTasksByConstruction,
  } as const;
}
