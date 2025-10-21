import { footerBlock } from '../templates/partials/footer';
import { headerBlock } from '../templates/partials/header';
import { container, formatDateTime } from '../utils/email';

export const generateTaskReminderTemplate = (task: any): string => {
  const reminderTime = task.reminder_datetime ? formatDateTime(task.reminder_datetime) : '未設置';

  const inner = `
    ${headerBlock('任務提醒')}
    <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
      <h3 style="margin-top: 0; color: #2c3e50;">${task.title}</h3>
      <p style="color: #555; margin-bottom: 10px;">${task.description || '無描述'}</p>
      <p style="color: #777; font-size: 14px;">
        <strong>提醒時間:</strong> ${reminderTime}<br>
        <strong>狀態:</strong> ${task.status}<br>
      </p>
    </div>
    ${footerBlock()}
  `;

  return container(inner);
};
