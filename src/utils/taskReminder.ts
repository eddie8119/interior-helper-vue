import type { TaskResponse } from '@/types/response';

import { TaskStatusEnum } from '@/types/task';
import { TaskTimeReminderStatus } from '@/types/task';

/**
 * 檢查任務的提醒狀態
 * @param task - 要檢查的任務對象
 * @returns TaskTimeReminderStatus
 */
export function getTaskTimeReminderStatus(task: TaskResponse): TaskTimeReminderStatus {
  if (!task.reminderDatetime || task.status === TaskStatusEnum.DONE) {
    return TaskTimeReminderStatus.NONE;
  }

  const now = new Date().getTime();
  const reminderTime = new Date(task.reminderDatetime).getTime();
  const timeDifference = reminderTime - now;

  // 過時條件：提醒時間已過
  if (timeDifference < 0) {
    return TaskTimeReminderStatus.OVERDUE;
  }

  // 提醒條件：距離提醒時間小於 24 小時
  const twentyFourHoursInMillis = 24 * 60 * 60 * 1000;
  if (timeDifference <= twentyFourHoursInMillis) {
    return TaskTimeReminderStatus.REMINDING;
  }

  return TaskTimeReminderStatus.NONE;
}
