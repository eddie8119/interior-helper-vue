import { headerBlock } from '../templates/partials/header';
import { footerBlock } from '../templates/partials/footer';
import { container, formatDateTime } from '../utils/email';

export const generateDailyDigestTemplate = (tasks: any[]): string => {
  const today = new Date().toLocaleDateString('zh-TW');
  const taskListHtml = tasks
    .map(
      (task) => `
      <div style="margin-bottom: 15px; padding: 10px; background-color: #f9f9f9; border-radius: 5px;">
        <h3 style="margin-top: 0; color: #2c3e50;">${task.title}</h3>
        <p style="color: #555; margin-bottom: 10px;">${task.description || '無描述'}</p>
        <p style="color: #777; font-size: 14px;">
          <strong>提醒時間:</strong> ${
            task.reminder_datetime ? formatDateTime(task.reminder_datetime) : '未設置'
          }<br>
          <strong>狀態:</strong> ${task.status}<br>
        </p>
      </div>
    `
    )
    .join('');

  const inner = `
    ${headerBlock(`每日任務摘要 - ${today}`)}
    <p>您今天有 ${tasks.length} 個任務需要處理：</p>
    <div style="margin: 20px 0;">
      ${taskListHtml}
    </div>
    ${footerBlock('如需管理通知設置，請登錄應用後訪問通知設置頁面。')}
  `;

  return container(inner);
};
