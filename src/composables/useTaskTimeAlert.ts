import { computed, type Ref } from 'vue';

import type { TaskResponse } from '@/types/response';

import { TaskTimeAlertStatus } from '@/types/task';
import { getTaskTimeAlertStatus } from '@/utils/taskReminder';

export function useTaskTimeAlert(task: Ref<TaskResponse>) {
  const timeAlertStatus = computed(() => getTaskTimeAlertStatus(task.value));

  const timeAlertLineClasses = computed(() => {
    switch (timeAlertStatus.value) {
      case TaskTimeAlertStatus.OVERDUE:
        return 'border-2 border-dashed border-secondary-red';
      case TaskTimeAlertStatus.REMINDING:
        return 'border-2 border-dashed border-secondary-yellow';
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

  return { timeAlertStatus, timeAlertLineClasses, timeAlertAreaClasses } as const;
}
