# 電子郵件通知功能使用說明

## 目錄
- [功能概述](#功能概述)
- [安裝設置](#安裝設置)
- [使用方法](#使用方法)
- [測試功能](#測試功能)
- [常見問題](#常見問題)

## 功能概述

電子郵件通知功能提供兩種主要服務：
1. **每日任務摘要**：每天 00:00 自動發送當天所有待辦任務的摘要郵件
2. **手動觸發摘要**：通過 API 端點手動觸發發送每日摘要

此功能與 LINE 提醒功能互補，共同構成完整的任務提醒系統。

## 安裝設置

### 1. 安裝依賴包

```bash
cd server
npm install nodemailer --save
npm install @types/nodemailer --save-dev
```

### 2. 設置環境變量

複製 `reminder.env.example` 文件為 `.env`，並填入電子郵件相關的配置：

```bash
cp reminder.env.example .env
```

重要的電子郵件配置項：
```
# 電子郵件配置
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.example.com  # 例如 Gmail: smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false  # 設置為 true 表示使用 SSL/TLS (通常用於 port 465)
EMAIL_USER=your_email_user
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=noreply@example.com
EMAIL_FROM_NAME="任務提醒系統"
```

### 3. 常見郵件服務商設置

#### Gmail
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_gmail_account@gmail.com
EMAIL_PASSWORD=your_app_password  # 需要在 Google 帳戶中生成應用專用密碼
```

#### Outlook/Hotmail
```
EMAIL_HOST=smtp.office365.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_outlook_account@outlook.com
EMAIL_PASSWORD=your_password
```

#### Yahoo
```
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your_yahoo_account@yahoo.com
EMAIL_PASSWORD=your_password
```

## 使用方法

### 1. 啟動電子郵件提醒服務

```bash
cd server
npm run start-reminder
```

這將啟動排程服務，包括：
- 每 5 分鐘檢查一次需要發送 LINE 提醒的任務
- 每天 00:00 發送當天所有待辦任務的摘要郵件

### 2. 手動觸發發送每日摘要

可以通過 API 端點手動觸發發送每日摘要：

```
POST /api/notifications/send-daily-digest
```

前端可以在通知管理頁面添加一個按鈕，調用此 API 端點。

### 3. 用戶設置

用戶可以在應用的「通知設置」頁面中：
- 啟用/禁用電子郵件通知
- 啟用/禁用 LINE 通知

## 測試功能

### 1. 使用測試腳本

我們提供了兩個測試腳本：

#### 測試 LINE 提醒
```bash
npm run test-reminder
```

#### 測試電子郵件摘要
```bash
npm run test-email
```

### 2. 測試步驟

1. 設置正確的環境變量（特別是 TEST_USER_ID 和 TEST_PROJECT_ID）
2. 運行測試腳本
3. 檢查郵箱是否收到測試郵件
4. 檢查數據庫中任務的 email_reminder_sent 字段是否已更新為 true

### 3. 故障排除

如果測試失敗，請檢查：
- 環境變量是否正確設置
- 郵件服務器是否可以連接（檢查日誌中的連接錯誤）
- 郵件是否被標記為垃圾郵件
- 防火牆或安全設置是否阻止了郵件發送

## 常見問題

### 未收到電子郵件摘要

1. 確認用戶已啟用電子郵件通知（UserSettings 表中的 email_notifications_enabled 為 true）
2. 確認郵件服務配置正確
3. 檢查郵件是否被標記為垃圾郵件
4. 檢查服務器日誌是否有錯誤信息

### 如何修改電子郵件模板

電子郵件模板定義在 `server/src/services/notification/email.service.ts` 文件中：
- `generateTaskReminderTemplate`: 單個任務提醒的模板
- `generateDailyDigestTemplate`: 每日摘要的模板

您可以修改這些函數來自定義電子郵件的外觀和內容。

### 如何更改發送時間

排程時間定義在環境變量中：
- `CHECK_LINE_REMINDERS_CRON`: LINE 提醒檢查的排程（默認每 5 分鐘一次）
- `DAILY_EMAIL_DIGEST_CRON`: 每日摘要的排程（默認每天 00:00）

您可以修改這些值來更改發送時間，使用標準的 cron 表達式格式。
