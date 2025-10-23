# 協作邀請系統完整文檔

## 系統概述

協作邀請系統提供完整的邀請流程，支持以下三個核心需求：

### 1. **Email 通知** 
當發送邀請時，系統自動發送郵件給被邀請者。

### 2. **已註冊用戶通知界面**
已註冊的用戶可以在應用內看到邀請通知並接受/拒絕。

### 3. **未註冊用戶引導流程**
未註冊用戶通過郵件鏈接訪問邀請頁面，引導其註冊後接受邀請。

---

## 系統架構

### 數據庫層

**CollaboratorInvitations 表** (`server/supabase/migrations/20251012100000_create_collaborator_invitations.sql`)

```sql
- id: UUID (主鍵)
- invitation_type: 'project' | 'global' (邀請類型)
- project_id: UUID (專案ID，僅限project類型)
- inviter_id: UUID (邀請人ID)
- invitee_email: TEXT (被邀請人郵箱)
- role: 'viewer' | 'editor' | 'manager' (協作者角色)
- status: 'pending' | 'accepted' | 'rejected' (邀請狀態)
- invitation_token: TEXT (邀請令牌，用於鏈接)
- expires_at: TIMESTAMPTZ (過期時間)
- accepted_at: TIMESTAMPTZ (接受時間)
- created_at, updated_at: TIMESTAMPTZ
```

### 後端層

#### 1. **郵件服務** (`server/src/services/notification/`)

- **mailer.ts**: Nodemailer 配置和郵件發送器
  - 驗證SMTP連接
  - 提供 `sendMail()` 函數
  - 支持環境變量配置

- **email.service.ts**: 郵件服務類
  - `sendTaskReminder()`: 發送任務提醒
  - `sendDailyDigest()`: 發送每日摘要
  - **`sendCollaboratorInvitation()`**: 發送協作邀請郵件

- **templates/invitation.ts**: 邀請郵件HTML模板
  - 生成專業的邀請郵件
  - 包含接受鏈接、角色信息
  - 支持專案和全域邀請

#### 2. **API 控制器** (`server/src/controllers/invitation.ts`)

```typescript
// 創建邀請
createProjectInvitation(projectId, collaboratorEmail, role)
createGlobalInvitation(collaboratorEmail, role)

// 查詢邀請
getMyInvitations()  // 獲取我收到的邀請
getSentInvitations()  // 獲取我發出的邀請
getInvitationByToken(token)  // 通過token獲取邀請詳情

// 處理邀請
acceptInvitation(invitationToken)  // 接受邀請
rejectInvitation(invitationId)  // 拒絕邀請
cancelInvitation(invitationId)  // 取消邀請（邀請人）
```

#### 3. **路由** (`server/src/routes/invitation.ts`)

```
GET  /api/invitations/token/:token  (公開，無需認證)
GET  /api/invitations/received
GET  /api/invitations/sent
POST /api/invitations/project/:projectId
POST /api/invitations/global
POST /api/invitations/accept/:invitationToken
POST /api/invitations/reject/:invitationId
DELETE /api/invitations/:invitationId
```

### 前端層

#### 1. **API 服務** (`src/api/invitation.ts`)

提供與後端對應的API調用函數。

#### 2. **Composables** (`src/composables/useInvitations.ts`)

```typescript
// 基礎hooks
useInvitations()  // 獲取並管理邀請列表
useSentInvitations()  // 管理已發送邀請
useCreateInvitation()  // 創建邀請

// 新增hooks（支持邀請流程）
useMyInvitations()  // 獲取我的邀請
useInvitationByToken(token)  // 通過token獲取邀請
useAcceptInvitation()  // 接受邀請
useRejectInvitation()  // 拒絕邀請
```

#### 3. **UI 組件**

**InvitationAccept.vue** (`src/views/InvitationAccept.vue`)
- **用途**: 未註冊用戶引導頁面
- **路由**: `/invitation/accept?token={token}`
- **功能**:
  - 顯示邀請詳情（邀請人、專案、角色等）
  - 未登入用戶：顯示登入/註冊按鈕
  - 已登入用戶：顯示接受邀請按鈕
  - 處理過期、無效token等錯誤

**InvitationNotifications.vue** (`src/components/notification/InvitationNotifications.vue`)
- **用途**: 已註冊用戶的通知組件
- **功能**:
  - 顯示待處理邀請列表
  - 支持直接接受/拒絕邀請
  - 顯示邀請類型、角色、過期時間

#### 4. **路由配置** (`src/router/index.ts`)

```javascript
{
  path: '/invitation/accept',
  name: 'invitation-accept',
  component: () => import('../views/InvitationAccept.vue'),
  meta: { public: true },  // 無需認證，允許未登入用戶訪問
}
```

#### 5. **類型定義** (`src/types/response.ts`)

```typescript
export type CollaboratorRole = 'viewer' | 'editor' | 'manager';
export type InvitationType = 'project' | 'global';
export type InvitationStatus = 'pending' | 'accepted' | 'rejected';

export interface CollaboratorInvitationResponse {
  id: string;
  invitationType: InvitationType;
  projectId: string | null;
  inviterId: string;
  inviteeEmail: string;
  role: CollaboratorRole;
  status: InvitationStatus;
  invitationToken: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  acceptedAt: Date | null;
  projects?: { title: string };
  inviterName?: string;
}
```

---

## 完整流程示例

### 場景 1: 已註冊用戶接受邀請

1. **邀請人發送邀請**
   ```
   POST /api/invitations/project/:projectId
   Body: { collaboratorEmail: "user@example.com", role: "editor" }
   ```

2. **系統處理**
   - 創建邀請記錄（status: pending）
   - 生成唯一 token
   - **發送郵件**給被邀請者
   - 郵件包含接受鏈接：`/invitation/accept?token={token}`

3. **被邀請人（已註冊）**
   - 收到郵件
   - 登入應用後，在 `InvitationNotifications` 組件看到通知
   - 點擊「接受」按鈕

4. **系統更新**
   - 更新邀請狀態為 `accepted`
   - 創建 `ProjectCollaborators` 記錄
   - 重定向到專案頁面

### 場景 2: 未註冊用戶接受邀請

1. **邀請人發送邀請**（同上）

2. **系統處理**（同上）

3. **被邀請人（未註冊）**
   - 收到郵件
   - 點擊郵件中的鏈接：`/invitation/accept?token={token}`
   - 訪問 `InvitationAccept.vue` 頁面

4. **InvitationAccept 頁面顯示**
   - 邀請詳情（邀請人、專案、角色）
   - 提示：「請登入或註冊以接受此邀請」
   - 顯示「登入」和「註冊」按鈕

5. **用戶點擊「註冊」**
   - 跳轉到註冊頁：`/auth/register?redirect=/invitation/accept?token={token}`
   - 完成註冊並自動登入

6. **重定向回邀請頁面**
   - 已登入狀態
   - 顯示「接受邀請」按鈕
   - 點擊接受

7. **系統完成邀請**
   - 更新邀請狀態
   - 創建協作者記錄
   - 重定向到專案頁面

---

## 環境配置

### 必需的環境變量 (server/.env)

```env
# SMTP 配置
EMAIL_HOST=smtp.gmail.com  # SMTP服務器地址
EMAIL_PORT=465  # SMTP端口 (587用STARTTLS, 465用SMTPS)
EMAIL_SECURE=true  # 是否使用SSL/TLS
EMAIL_USER=your-email@gmail.com  # SMTP用戶名
EMAIL_PASSWORD=your-app-password  # SMTP密碼或應用密碼
EMAIL_FROM=your-email@gmail.com  # 發件人地址
EMAIL_FROM_NAME=專案協作系統  # 發件人名稱

# 前端URL（用於生成邀請鏈接）
FRONTEND_URL=http://localhost:5173
```

### Gmail 配置示例

1. 啟用 Google 兩步驟驗證
2. 生成應用專用密碼
3. 使用應用密碼作為 `EMAIL_PASSWORD`

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SECURE=true
EMAIL_USER=yourname@gmail.com
EMAIL_PASSWORD=your-16-char-app-password
EMAIL_FROM=yourname@gmail.com
EMAIL_FROM_NAME=專案協作系統
FRONTEND_URL=http://localhost:5173
```

---

## 測試郵件發送

### 1. 使用 Mailtrap（開發環境推薦）

```env
EMAIL_HOST=sandbox.smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_SECURE=false
EMAIL_USER=<your-mailtrap-username>
EMAIL_PASSWORD=<your-mailtrap-password>
EMAIL_FROM=noreply@yourdomain.com
```

### 2. 檢查郵件發送日誌

服務器啟動時會顯示：
```
[mailer] 郵件服務連接成功
```

發送郵件時會記錄：
```
[mailer] Sending email { to, subject, from }
[mailer] Email sent { messageId, response }
```

發送失敗會顯示：
```
[mailer] Failed to send email <錯誤詳情>
```

---

## 國際化 (i18n)

所有UI文字已支持多語言（繁體中文、英文）：

- `src/locales/module/message.json`: 邀請相關消息
- `src/locales/module/button.json`: 按鈕文字
- `src/locales/module/title.json`: 標題文字
- `src/locales/module/label.json`: 標籤文字

---

## 安全性考慮

1. **Token 安全**
   - 使用 `crypto.randomBytes(32)` 生成唯一token
   - Token存儲在數據庫，不可預測

2. **過期機制**
   - 邀請設有過期時間（默認7天）
   - 過期邀請無法接受

3. **權限驗證**
   - 只有專案所有者可創建專案邀請
   - 只有邀請接收者可接受邀請
   - 公開路由僅限獲取邀請詳情

4. **防止重複**
   - 同一郵箱對同一專案只能有一個pending邀請
   - 接受邀請時檢查是否已是協作者

---

## 故障排除

### 郵件未發送

1. 檢查環境變量是否正確配置
2. 查看服務器日誌中的 `[mailer]` 訊息
3. 確認SMTP端口未被防火牆阻擋
4. 檢查EMAIL_FROM是否為SMTP服務器允許的地址

### 邀請鏈接無效

1. 檢查FRONTEND_URL環境變量
2. 確認路由已正確配置
3. 檢查token是否已過期

### 無法接受邀請

1. 確認用戶已登入
2. 檢查邀請狀態（是否已被處理）
3. 查看網絡請求錯誤詳情

---

## 未來優化建議

1. **邀請管理界面**: 為管理員提供查看所有邀請的界面
2. **批量邀請**: 支持一次邀請多個用戶
3. **邀請模板**: 允許自定義邀請郵件模板
4. **提醒機制**: 對未處理的邀請發送提醒郵件
5. **統計分析**: 邀請接受率、響應時間等統計

---

## 相關文件清單

### 後端
- `server/supabase/migrations/20251012100000_create_collaborator_invitations.sql`
- `server/src/controllers/invitation.ts`
- `server/src/routes/invitation.ts`
- `server/src/services/notification/mailer.ts`
- `server/src/services/notification/email.service.ts`
- `server/src/services/notification/templates/invitation.ts`
- `server/src/types/response.ts`

### 前端
- `src/api/invitation.ts`
- `src/composables/useInvitations.ts`
- `src/views/InvitationAccept.vue`
- `src/components/notification/InvitationNotifications.vue`
- `src/types/response.ts`
- `src/router/index.ts`
- `src/locales/module/*.json`

---

## 總結

協作邀請系統已完整實現三個核心需求：

✅ **需求1**: Email通知 - 通過mailer.ts和email模板發送專業郵件  
✅ **需求2**: 已註冊用戶通知 - InvitationNotifications組件提供應用內通知  
✅ **需求3**: 未註冊用戶引導 - InvitationAccept頁面引導註冊並接受邀請  

系統已準備就緒，配置好SMTP後即可使用！
