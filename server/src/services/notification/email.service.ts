import { generateAccountActivationTemplate } from './templates/accountActivation';
import { generateDailyDigestTemplate } from './templates/dailyDigest';
import { generateInvitationTemplate } from './templates/invitation';
import {
  generatePasswordChangedTemplate,
  generatePasswordResetTemplate,
} from './templates/passwordReset';
import { generateTaskReminderTemplate } from './templates/taskReminder';

import type { CollaboratorRole, InvitationType } from '@/types/response';

import { supabase } from '@/lib/supabase';
import { sendMail } from '@/services/notification/mailer';

// 用於發送任務提醒和每日摘要
export class EmailService {
  /**
   * 發送單個任務提醒郵件
   */
  async sendTaskReminder(userId: string, task: any): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      if (!userData?.user?.email) {
        console.error('獲取用戶郵箱失敗');
        return false;
      }

      await sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || '任務提醒系統'}" <${process.env.EMAIL_FROM}>`,
        to: userData.user.email,
        subject: `任務提醒: ${task.title}`,
        html: generateTaskReminderTemplate(task),
      });

      return true;
    } catch (error) {
      console.error('發送任務提醒郵件失敗:', error);
      return false;
    }
  }

  /**
   * 發送每日任務摘要郵件
   */
  async sendDailyDigest(userId: string, tasks: any[]): Promise<boolean> {
    try {
      if (tasks.length === 0) {
        console.log(`用戶 ${userId} 今天沒有需要提醒的任務`);
        return true;
      }

      const { data: userData } = await supabase.auth.admin.getUserById(userId);
      if (!userData?.user?.email) {
        console.error('獲取用戶郵箱失敗');
        return false;
      }

      const { data: settings } = await supabase
        .from('UserSettings')
        .select('email_notifications_enabled')
        .eq('user_id', userId)
        .single();

      if (settings?.email_notifications_enabled === false) {
        console.log(`用戶 ${userId} 已禁用郵件通知`);
        return true;
      }

      await sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || '任務提醒系統'}" <${process.env.EMAIL_FROM}>`,
        to: userData.user.email,
        subject: `每日任務摘要 - ${new Date().toLocaleDateString('zh-TW')}`,
        html: generateDailyDigestTemplate(tasks),
      });

      return true;
    } catch (error) {
      console.error('發送每日摘要郵件失敗:', error);
      return false;
    }
  }

  /**
   * 發送協作者邀請郵件
   */
  async sendCollaboratorInvitation(
    inviterName: string,
    inviteeEmail: string,
    invitationType: InvitationType,
    role: CollaboratorRole,
    invitationToken: string,
    projectName?: string
  ): Promise<boolean> {
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const acceptUrl = `${frontendUrl}/invitation/accept?token=${invitationToken}`;

      const subject =
        invitationType === 'project' ? `協作邀請：${projectName}` : '協作邀請：全域專案協作者';

      await sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || '專案協作系統'}" <${process.env.EMAIL_FROM}>`,
        to: inviteeEmail,
        subject,
        html: generateInvitationTemplate(inviterName, invitationType, role, acceptUrl, projectName),
      });

      return true;
    } catch (error) {
      console.error('發送協作邀請郵件失敗:', error);
      return false;
    }
  }

  /**
   * 發送帳戶激活郵件
   */
  async sendActivationEmail(
    email: string,
    activationToken: string,
    userName?: string
  ): Promise<boolean> {
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const activationLink = `${frontendUrl}/auth/account-activation?token=${activationToken}&email=${encodeURIComponent(email)}`;

      await sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || 'HSWE IoT'}" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: '驗證您的 HSWE IoT 帳戶',
        html: generateAccountActivationTemplate({
          email,
          activationLink,
          expiresIn: '24 小時',
          userName,
        }),
      });
      return true;
    } catch (error) {
      console.error('[sendActivationEmail] Failed to send activation email to', email, error);
      return false;
    }
  }

  /**
   * 發送密碼重置郵件
   */
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<boolean> {
    try {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

      await sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || '帳戶安全系統'}" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: '重置您的密碼',
        html: generatePasswordResetTemplate({
          email,
          resetLink,
          expiresIn: '1 小時',
        }),
      });

      return true;
    } catch (error) {
      console.error('發送密碼重置郵件失敗:', error);
      return false;
    }
  }

  /**
   * 發送密碼更改成功通知郵件
   */
  async sendPasswordChangedNotification(email: string): Promise<boolean> {
    try {
      await sendMail({
        from: `"${process.env.EMAIL_FROM_NAME || '帳戶安全系統'}" <${process.env.EMAIL_FROM}>`,
        to: email,
        subject: '密碼已成功更改',
        html: generatePasswordChangedTemplate(email),
      });

      return true;
    } catch (error) {
      console.error('發送密碼更改通知郵件失敗:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();
