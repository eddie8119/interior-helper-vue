import { computed } from 'vue';

import type { TaskResponse } from '@/types/response';

import { TaskTimeReminderStatus } from '@/types/task';
import { getTaskTimeReminderStatus } from '@/utils/taskReminder';

export function useTaskReminder(task: TaskResponse) {
  const reminderStatus = computed(() => getTaskTimeReminderStatus(task));

  const reminderLineClasses = computed(() => {
    switch (reminderStatus.value) {
      case TaskTimeReminderStatus.OVERDUE:
        return 'border-2 border-dashed border-secondary-red';
      case TaskTimeReminderStatus.REMINDING:
        return 'border-2 border-dashed border-secondary-yellow';
      default:
        return '';
    }
  });

  const reminderAreaClasses = computed(() => {
    switch (reminderStatus.value) {
      case TaskTimeReminderStatus.OVERDUE:
        return 'bg-secondary-red';
      case TaskTimeReminderStatus.REMINDING:
        return 'bg-secondary-yellow text-black-900';
      default:
        return '';
    }
  });

  return { reminderStatus, reminderLineClasses, reminderAreaClasses } as const;
}
