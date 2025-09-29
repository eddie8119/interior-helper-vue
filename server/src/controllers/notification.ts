import { Request, Response } from 'express';
import { reminderService } from '@/services/tasks/check-reminders';

// 手動觸發檢查需要發送的提醒
export const checkReminders = async (req: Request, res: Response) => {
  try {
    const result = await reminderService.checkLineReminders();
    
    return res.status(200).json({
      success: true,
      message: `成功檢查提醒任務，已發送 ${result.count} 個提醒`,
      data: result,
    });
  } catch (error: any) {
    console.error('檢查提醒任務失敗:', error);
    return res.status(500).json({
      success: false,
      message: error.message || '檢查提醒任務時發生錯誤',
    });
  }
};

// 獲取待發送提醒的任務列表
export const getPendingReminders = async (req: Request, res: Response) => {
  try {
    const reminders = await reminderService.getPendingReminders();
    
    return res.status(200).json({
      success: true,
      data: reminders,
    });
  } catch (error: any) {
    console.error('獲取待發送提醒的任務失敗:', error);
    return res.status(500).json({
      success: false,
      message: error.message || '獲取待發送提醒的任務時發生錯誤',
    });
  }
};

// 重置任務的提醒狀態
export const resetReminderStatus = async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    
    if (!taskId) {
      return res.status(400).json({
        success: false,
        message: '缺少任務 ID',
      });
    }
    
    const success = await reminderService.resetReminderStatus(taskId);
    
    if (!success) {
      return res.status(500).json({
        success: false,
        message: '重置任務提醒狀態失敗',
      });
    }
    
    return res.status(200).json({
      success: true,
      message: '成功重置任務提醒狀態',
    });
  } catch (error: any) {
    console.error('重置任務提醒狀態失敗:', error);
    return res.status(500).json({
      success: false,
      message: error.message || '重置任務提醒狀態時發生錯誤',
    });
  }
};
