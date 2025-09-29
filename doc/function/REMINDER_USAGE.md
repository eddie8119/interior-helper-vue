# 任務提醒系統使用說明

## 目錄
- [系統概述](#系統概述)
- [安裝設置](#安裝設置)
- [使用方法](#使用方法)
- [測試系統](#測試系統)
- [常見問題](#常見問題)

## 系統概述

任務提醒系統提供兩種提醒方式：
1. **LINE 即時提醒**：在任務提醒時間前 30 分鐘發送
2. **每日電子郵件摘要**：每天 00:00 發送當天所有待辦任務的摘要

系統使用 node-cron 定期檢查需要發送提醒的任務，並通過 LINE Notify 和電子郵件發送通知。

## 安裝設置

### 1. 安裝依賴包

```bash
cd server
npm install
```

### 2. 設置環境變量

複製 `reminder.env.example` 文件為 `.env`，並填入相應的值：

```bash
cp reminder.env.example .env
```

### 3. 更新數據庫結構

執行以下 SQL 腳本，為 Tasks 表添加提醒相關欄位：

```sql
-- 為 Tasks 表添加提醒相關欄位
ALTER TABLE Tasks 
ADD COLUMN IF NOT EXISTS line_reminder_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_reminder_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMP WITH TIME ZONE;

-- 創建索引以優化查詢效能
CREATE INDEX IF NOT EXISTS idx_tasks_reminder_datetime 
ON Tasks(reminder_datetime) 
WHERE reminder_datetime IS NOT NULL;
```

### 4. 創建 UserSettings 表

執行以下 SQL 腳本，創建用於存儲用戶通知設置的表：

```sql
-- 創建 UserSettings 表來存儲用戶的通知設置
CREATE TABLE IF NOT EXISTS UserSettings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  line_notify_token TEXT,
  email_notifications_enabled BOOLEAN DEFAULT TRUE,
  line_notifications_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 創建 RLS 策略
ALTER TABLE UserSettings ENABLE ROW LEVEL SECURITY;

-- 只允許用戶訪問自己的設置
CREATE POLICY "Users can view their own settings" ON UserSettings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON UserSettings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON UserSettings
  FOR UPDATE USING (auth.uid() = user_id);
```

## 使用方法

### 1. 啟動提醒服務

```bash
cd server
npm run start-reminder
```

這將啟動提醒排程服務，定期檢查需要發送提醒的任務。

### 2. 設置 LINE Notify Token

用戶需要在應用中設置自己的 LINE Notify Token，才能接收 LINE 提醒：

1. 訪問 https://notify-bot.line.me/zh_TW/ 獲取 LINE Notify Token
2. 在應用的「通知設置」頁面中設置 Token

### 3. 創建帶有提醒的任務

在創建或編輯任務時，設置 `reminder_datetime` 字段為提醒時間。

## 測試系統

### 1. 使用測試腳本

```bash
cd server
npm run test-reminder
```

這將創建一個測試任務，並在 5 秒後檢查提醒。

### 2. 手動測試

1. 創建一個提醒時間在未來 30 分鐘內的任務
2. 訪問 `/notifications` 頁面
3. 點擊「檢查提醒」按鈕手動觸發提醒檢查

## 常見問題

### 未收到 LINE 提醒

1. 確認用戶已設置正確的 LINE Notify Token
2. 確認 `line_notifications_enabled` 設置為 `true`
3. 檢查任務的 `reminder_datetime` 是否正確設置
4. 檢查服務器日誌是否有錯誤信息

### 未收到電子郵件摘要

1. 確認電子郵件服務配置正確
2. 確認 `email_notifications_enabled` 設置為 `true`
3. 檢查服務器日誌是否有錯誤信息

### 如何重置已發送的提醒

在「通知管理」頁面中，可以點擊任務旁的「重置」按鈕重置提醒狀態，這樣系統將重新發送提醒。
