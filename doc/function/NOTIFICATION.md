# 任務提醒通知系統

## 目錄

- [功能概述](#功能概述)
- [系統架構](#系統架構)
- [數據庫設計](#數據庫設計)
- [API 端點](#api-端點)
- [排程服務](#排程服務)
- [通知服務](#通知服務)
- [錯誤處理與日誌](#錯誤處理與日誌)
- [測試策略](#測試策略)
- [部署考量](#部署考量)

## 功能概述

本系統提供任務提醒功能，根據任務的 `reminder_date_time` 自動發送提醒：

1. **LINE 即時提醒**：
   - 在任務提醒時間前 30 分鐘發送
   - 即時通知用戶即將到來的任務

2. **每日電子郵件摘要**：
   - 每天 00:00 發送
   - 包含當天所有待辦任務的摘要

## 系統架構

```
src/
  services/
    notification/
      line.service.ts      # LINE 通知服務
      email.service.ts     # 電子郵件服務
    scheduler/
      reminder.scheduler.ts # 排程任務邏輯
    tasks/
      check-reminders.ts   # 檢查並發送提醒的邏輯
```

## 數據庫設計

### 新增欄位

```sql
ALTER TABLE Tasks
ADD COLUMN IF NOT EXISTS line_reminder_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_reminder_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_reminder_sent_at TIMESTAMP WITH TIME ZONE;
```

### 索引優化

```sql
CREATE INDEX IF NOT EXISTS idx_tasks_reminder_date_time
ON Tasks(reminder_date_time)
WHERE reminder_date_time IS NOT NULL;
```

## API 端點

### 1. 檢查待發送提醒

```
GET /api/notifications/pending-reminders
```

**響應**

```json
{
  "success": true,
  "data": [
    {
      "id": "task-123",
      "title": "設計會議",
      "reminder_date_time": "2025-10-01T14:30:00Z",
      "user_id": "user-456"
    }
  ]
}
```

## 排程服務

### 實現選項

1. **Node.js 排程庫**
   - 使用 `node-cron` 或 `agenda`
   - 適合小型應用，簡單易實現

2. **雲函數排程**
   - Supabase Edge Functions 或 AWS Lambda
   - 使用 CloudWatch Events/EventBridge 觸發
   - 適合無服務器架構

### 排程邏輯

1. **LINE 提醒檢查**（每5分鐘執行）

   ```typescript
   // 查找 reminder_date_time 在未來30分鐘內的任務
   // 且 line_reminder_sent = false
   ```

2. **電子郵件摘要**（每天00:00執行）
   ```typescript
   // 查找 reminder_date_time 為當天的所有任務
   // 且 email_reminder_sent = false
   ```

## 通知服務

### LINE 通知服務

```typescript
// services/notification/line.service.ts
export class LineNotificationService {
  async sendReminder(userId: string, task: Task): Promise<boolean> {
    // 實現 LINE Notify 集成
  }
}
```

### 電子郵件服務

```typescript
// services/notification/email.service.ts
export class EmailNotificationService {
  async sendDailyDigest(userId: string, tasks: Task[]): Promise<boolean> {
    // 實現電子郵件發送邏輯
  }
}
```

## 錯誤處理與日誌

1. **重試機制**
   - 失敗的發送嘗試最多重試3次
   - 指數退避策略

2. **日誌記錄**
   - 記錄所有發送嘗試
   - 記錄失敗原因
   - 設置日誌級別（DEBUG, INFO, ERROR）

## 測試策略

1. **單元測試**
   - 測試提醒時間計算邏輯
   - 測試通知服務

2. **整合測試**
   - 測試排程觸發
   - 測試數據庫交互

3. **端到端測試**
   - 完整流程測試
   - 模擬外部服務

## 部署考量

1. **環境變數**

   ```env
   # LINE Notify
   LINE_NOTIFY_TOKEN=your_line_token

   # Email Service
   EMAIL_SERVICE=sendgrid
   SENDGRID_API_KEY=your_sendgrid_key

   # 排程設置
   CHECK_REMINDERS_CRON="*/5 * * * *"
   DAILY_DIGEST_CRON="0 0 * * *"
   ```

2. **監控與警報**
   - 設置錯誤警報
   - 監控排程任務執行狀況

3. **擴展性**
   - 考慮使用消息隊列（如 Redis, SQS）處理大量通知
   - 實現速率限制

## 後續優化

1. 支持多種通知渠道（如 SMS, 推送通知）
2. 用戶自定義提醒時間
3. 通知模板管理
4. 通知偏好設置
