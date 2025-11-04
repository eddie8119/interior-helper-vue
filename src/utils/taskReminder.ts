import type { TaskResponse } from '@/types/response';

import { TaskStatusEnum } from '@/types/task';
import { TaskTimeReminderStatus } from '@/types/task';

/**
 * 檢查任務的提醒狀態
 * @param task - 要檢查的任務對象
 * @returns TaskTimeReminderStatus
 */
export function getTaskTimeReminderStatus(task: TaskResponse): TaskTimeReminderStatus {
  // 如果任務已完成，則沒有任何時間狀態
  if (task.status === TaskStatusEnum.DONE) {
    return TaskTimeReminderStatus.NONE;
  }

  const now = new Date();

  // 1. 檢查逾期狀態 (基於 endDate，精確到「當下時間」)
  if (task.endDate) {
    const endDate = new Date(task.endDate);
    if (endDate.getTime() < now.getTime()) {
      return TaskTimeReminderStatus.OVERDUE;
    }
  }

  // 2. 檢查提醒狀態 (基於 reminderDatetime)
  if (task.reminderDatetime) {
    const reminderTime = new Date(task.reminderDatetime);
    // 如果提醒時間已過，就觸發提醒
    if (reminderTime <= new Date()) {
      return TaskTimeReminderStatus.REMINDING;
    }
  }

  // 3. 如果以上條件都不滿足，則無狀態
  return TaskTimeReminderStatus.NONE;
}

// 逾期狀態：檢查 endDate。如果 endDate 早於今天，任務會被標記為 OVERDUE。
// 提醒狀態：如果任務未逾期，接著檢查 reminderDatetime。如果當前時間已經超過了設定的提醒時間，任務會被標記為 REMINDING
