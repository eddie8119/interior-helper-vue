import nodemailer from 'nodemailer';
import { supabase } from '@/lib/supabase';

/**
 * 電子郵件服務
 * 用於發送任務提醒和每日摘要
 */
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // 創建郵件傳輸器
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587', 10),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    
    // 測試郵件傳輸器連接
    if (process.env.NODE_ENV !== 'test') {
      this.transporter.verify()
        .then(() => console.log('郵件服務連接成功'))
        .catch((err) => console.error('郵件服務連接失敗:', err));
    }
  }

  /**
   * 發送單個任務提醒郵件
   * @param userId 用戶ID
   * @param task 任務對象
   * @returns 是否發送成功
   */
  async sendTaskReminder(userId: string, task: any): Promise<boolean> {
    try {
      // 獲取用戶郵箱
      const { data: user, error: userError } = await supabase
        .from('auth.users')
        .select('email')
        .eq('id', userId)
        .single();

      if (userError || !user?.email) {
        console.error('獲取用戶郵箱失敗:', userError);
        return false;
      }

      // 發送郵件
      await this.transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || '任務提醒系統'}" <${process.env.EMAIL_FROM}>`,
        to: user.email,
        subject: `任務提醒: ${task.title}`,
        html: this.generateTaskReminderTemplate(task),
      });

      return true;
    } catch (error) {
      console.error('發送任務提醒郵件失敗:', error);
      return false;
    }
  }

  /**
   * 發送每日任務摘要郵件
   * @param userId 用戶ID
   * @param tasks 任務列表
   * @returns 是否發送成功
   */
  async sendDailyDigest(userId: string, tasks: any[]): Promise<boolean> {
    try {
      if (tasks.length === 0) {
        console.log(`用戶 ${userId} 今天沒有需要提醒的任務`);
        return true; // 沒有任務也算成功
      }

      // 獲取用戶郵箱
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId);

      if (userError || !userData?.user?.email) {
        console.error('獲取用戶郵箱失敗:', userError);
        return false;
      }

      // 獲取用戶設置
      const { data: settings, error: settingsError } = await supabase
        .from('UserSettings')
        .select('email_notifications_enabled')
        .eq('user_id', userId)
        .single();

      // 如果用戶禁用了郵件通知，則跳過
      if (settings && settings.email_notifications_enabled === false) {
        console.log(`用戶 ${userId} 已禁用郵件通知`);
        return true;
      }

      // 發送郵件
      await this.transporter.sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || '任務提醒系統'}" <${process.env.EMAIL_FROM}>`,
        to: userData.user.email,
        subject: `每日任務摘要 - ${new Date().toLocaleDateString('zh-TW')}`,
        html: this.generateDailyDigestTemplate(tasks),
      });

      return true;
    } catch (error) {
      console.error('發送每日摘要郵件失敗:', error);
      return false;
    }
  }

  /**
   * 生成單個任務提醒的郵件模板
   * @param task 任務對象
   * @returns HTML 模板
   */
  private generateTaskReminderTemplate(task: any): string {
    const reminderTime = task.reminder_datetime
      ? new Date(task.reminder_datetime).toLocaleString('zh-TW')
      : '未設置';

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #333;">任務提醒</h2>
        <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
          <h3 style="margin-top: 0; color: #2c3e50;">${task.title}</h3>
          <p style="color: #555; margin-bottom: 10px;">${task.description || '無描述'}</p>
          <p style="color: #777; font-size: 14px;">
            <strong>提醒時間:</strong> ${reminderTime}<br>
            <strong>狀態:</strong> ${task.status}<br>
          </p>
        </div>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center;">
          這是一封自動發送的郵件，請勿直接回复。
        </div>
      </div>
    `;
  }

  /**
   * 生成每日任務摘要的郵件模板
   * @param tasks 任務列表
   * @returns HTML 模板
   */
  private generateDailyDigestTemplate(tasks: any[]): string {
    const today = new Date().toLocaleDateString('zh-TW');
    const taskListHtml = tasks
      .map(
        (task) => `
        <div style="margin-bottom: 15px; padding: 10px; background-color: #f9f9f9; border-radius: 5px;">
          <h3 style="margin-top: 0; color: #2c3e50;">${task.title}</h3>
          <p style="color: #555; margin-bottom: 10px;">${task.description || '無描述'}</p>
          <p style="color: #777; font-size: 14px;">
            <strong>提醒時間:</strong> ${
              task.reminder_datetime
                ? new Date(task.reminder_datetime).toLocaleString('zh-TW')
                : '未設置'
            }<br>
            <strong>狀態:</strong> ${task.status}<br>
          </p>
        </div>
      `
      )
      .join('');

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h2 style="color: #333;">每日任務摘要 - ${today}</h2>
        <p>您今天有 ${tasks.length} 個任務需要處理：</p>
        <div style="margin: 20px 0;">
          ${taskListHtml}
        </div>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center;">
          這是一封自動發送的郵件，請勿直接回复。<br>
          如需管理通知設置，請登錄應用後訪問通知設置頁面。
        </div>
      </div>
    `;
  }
}

// 導出郵件服務實例
export const emailService = new EmailService();
