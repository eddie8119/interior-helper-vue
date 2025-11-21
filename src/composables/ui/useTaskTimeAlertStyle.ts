import { computed, type Ref } from 'vue';

import type { TaskResponse } from '@/types/response';

import { TaskTimeAlertStatus } from '@/types/task';
import { getTaskTimeAlertStatus } from '@/utils/taskReminder';

export function useTaskTimeAlertStyle(task: Ref<TaskResponse>) {
  const timeAlertStatus = computed(() => getTaskTimeAlertStatus(task.value));

  const timeAlertStyleClasses = computed(() => {
    switch (timeAlertStatus.value) {
      case TaskTimeAlertStatus.OVERDUE:
        return 'border-2 border-dashed border-secondary-red bg-red-100';
      case TaskTimeAlertStatus.REMINDING:
        return 'border-2 border-dashed border-secondary-yellow bg-yellow-100';
      default:
        return '';
    }
  });

  const timeAlertAreaClasses = computed(() => {
    switch (timeAlertStatus.value) {
      case TaskTimeAlertStatus.OVERDUE:
        return 'bg-secondary-red';
      case TaskTimeAlertStatus.REMINDING:
        return 'bg-secondary-yellow text-black-900';
      default:
        return '';
    }
  });

  return { timeAlertStatus, timeAlertStyleClasses, timeAlertAreaClasses } as const;
}
