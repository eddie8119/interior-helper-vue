import camelcaseKeys from 'camelcase-keys';
import { Request, Response } from 'express';
import snakecaseKeys from 'snakecase-keys';

import { supabase } from '@/lib/supabase';

// 獲取用戶的通知設置
export const getUserSettings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    // 查詢用戶設置
    const { data, error } = await supabase
      .from('UserSettings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 表示沒有找到記錄，這不是錯誤
      console.error('獲取用戶設置失敗:', error);
      return res.status(500).json({
        success: false,
        message: '獲取用戶設置失敗',
        error: error.message,
      });
    }

    // 如果沒有找到設置，返回默認設置
    if (!data) {
      return res.status(200).json({
        success: true,
        data: {
          userId,
          lineNotifyToken: null,
          emailNotificationsEnabled: true,
          lineNotificationsEnabled: true,
        },
      });
    }

    // 移除敏感字段並轉換為駝峰命名
    const { user_id, ...settings } = data;
    const safeSettings = camelcaseKeys(settings);

    return res.status(200).json({
      success: true,
      data: {
        ...safeSettings,
        userId,
      },
    });
  } catch (error: any) {
    console.error('獲取用戶設置時發生錯誤:', error);
    return res.status(500).json({
      success: false,
      message: error.message || '獲取用戶設置時發生錯誤',
    });
  }
};

// 更新用戶的通知設置
export const updateUserSettings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { lineNotifyToken, emailNotificationsEnabled, lineNotificationsEnabled } = req.body;

    // 檢查用戶設置是否已存在
    const { data: existingSettings } = await supabase
      .from('UserSettings')
      .select('id')
      .eq('user_id', userId)
      .single();

    let result;
    const settings = snakecaseKeys({
      lineNotifyToken,
      emailNotificationsEnabled,
      lineNotificationsEnabled,
      userId,
    });

    if (existingSettings) {
      // 更新現有設置
      result = await supabase.from('UserSettings').update(settings).eq('user_id', userId);
    } else {
      // 創建新設置
      result = await supabase.from('UserSettings').insert(settings);
    }

    if (result.error) {
      console.error('更新用戶設置失敗:', result.error);
      return res.status(500).json({
        success: false,
        message: '更新用戶設置失敗',
        error: result.error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: '成功更新用戶設置',
    });
  } catch (error: any) {
    console.error('更新用戶設置時發生錯誤:', error);
    return res.status(500).json({
      success: false,
      message: error.message || '更新用戶設置時發生錯誤',
    });
  }
};
