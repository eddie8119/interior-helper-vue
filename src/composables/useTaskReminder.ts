import { computed } from 'vue';

import type { TaskResponse } from '@/types/response';

import { getTaskTimeReminderStatus } from '@/utils/taskReminder';

export function useTaskReminder(task: TaskResponse) {
  const reminderStatus = computed(() => getTaskTimeReminderStatus(task));

  const reminderClasses = computed(() => {
    switch (reminderStatus.value) {
      case 'overdue':
        return 'border-2 border-dashed border-secondary-red';
      case 'reminding':
        return 'border-2 border-dashed border-secondary-yellow';
      default:
        return '';
    }
  });

  return { reminderStatus, reminderClasses } as const;
}
