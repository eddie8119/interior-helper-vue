# 協作者（Collaborator）系統說明

本文件說明本專案中的協作者模型、權限、資料結構、前後端流程、UI 元件與除錯建議。若需了解「邀請」完整機制，請參考根目錄的 `INVITATION_SYSTEM.md`。

---

## 一、系統概覽

協作者分為兩種層級：

- 專案協作者（Project Collaborator）：僅對特定專案具權限
- 全域協作者（Global Collaborator）：對所有專案具預設權限（可被專案覆蓋）

協作者指派採「邀請制」：管理者輸入 Email 與角色 → 系統發送邀請 → 受邀者接受後才會建立協作者關係。

---

## 二、角色與權限

- viewer（瀏覽者）
  - 可讀取專案內容
  - 不可修改任何資料
- editor（編輯者）
  - 可新增/修改/刪除任務與相關資料
  - 不可變更分享設定與成員
- manager（管理員）
  - 具備 editor 權限
  - 可管理協作者（新增/更新角色/移除）與分享設定

> 角色鍵值位於 `src/constants/selection.ts` 的 `COLLABORATOR_ROLE_OPTIONS`，i18n 顯示於 `src/locales/module/option.json` → `option.role.*`。

---

## 三、前端資料型別

來源：`src/types/response.ts`

- ProjectCollaboratorResponse
- GlobalCollaboratorResponse
- CollaboratorInvitationResponse（搭配邀請流程）

另外將型別拆分為：
- `src/types/collaborator.ts`：`CollaboratorRole`
- `src/types/invitation.ts`：`InvitationStatus`、`InvitationType`

---

## 四、API 端點

實際實作請參考 `server/src/controllers` 與 `server/src/routes`（路由名稱示意）：

- 協作者（直接操作現有協作者關係）
  - GET  `/collaborators/project/:projectId`
  - POST `/collaborators/project/:projectId`（僅限已存在的使用者或內部指派，實務上建議改走邀請）
  - PATCH `/collaborators/project/:projectId/:collaboratorId`
  - DELETE `/collaborators/project/:projectId/:collaboratorId`
  - GET  `/collaborators/global`
  - POST `/collaborators/global`（同上說明）
  - PATCH `/collaborators/global/:collaboratorId`
  - DELETE `/collaborators/global/:collaboratorId`

- 邀請（推薦流程）
  - POST `/invitations/project/:projectId`（建立專案協作邀請）
  - POST `/invitations/global`（建立全域協作邀請）
  - GET  `/invitations/received`（我收到的）
  - GET  `/invitations/sent`（我發出的）
  - GET  `/invitations/token/:token`（公開查詢）
  - POST `/invitations/accept/:token`（接受）
  - POST `/invitations/reject/:invitationId`（拒絕）
  - DELETE `/invitations/:invitationId`（邀請人取消）

前端 API 檔案：
- `src/api/collaborator.ts`
- `src/api/invitation.ts`

---

## 五、前端 Composables

- `src/composables/useCollaborators.ts`
  - useProjectCollaborators(projectId)
    - 讀取、更新、移除專案協作者
    - 新增協作者已改為呼叫 `createProjectInvitation()`（邀請制）
  - useGlobalCollaborators()
    - 讀取、更新、移除全域協作者
    - 新增協作者已改為呼叫 `createGlobalInvitation()`（邀請制）

- `src/composables/useInvitations.ts`
  - useMyInvitations / useSentInvitations / useCreateInvitation
  - useInvitationByToken / useAcceptInvitation / useRejectInvitation

---

## 六、UI 元件與頁面

- `src/components/core/dialog/CollaboratorDialog.vue`
  - 以對話框形式管理「單一專案」的協作者
  - 內含 `CollaboratorManagement.vue`
- `src/components/core/dialog/GlobalCollaboratorsDialog.vue`
  - 以對話框形式管理「全域協作者」
  - 內含 `CollaboratorManagement.vue`
- `src/components/core/collaborator/CollaboratorManagement.vue`
  - 通用協作者列表 + 新增/變更角色/移除
  - 新增協作者時觸發邀請 API
- `src/components/notification/InvitationNotifications.vue`
  - 顯示「我收到」的邀請，支援接受/拒絕
- `src/views/InvitationAccept.vue`
  - 公開頁（`/invitation/accept?token=...`），供未登入/未註冊用戶處理邀請

路由註冊：`src/router/index.ts`
- `path: '/invitation/accept'` 已公開（`meta: { public: true }`）

---

## 七、Email 通知

- 信件服務：`server/src/services/notification/email.service.ts`
  - `sendCollaboratorInvitation()` 會組出前端接受連結：`/invitation/accept?token=...`
- 模板工具：`server/src/services/utils/email.ts`
- 模板檔案：`server/src/services/notification/templates/invitation.ts`

環境變數：
- `EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM, EMAIL_FROM_NAME`
- `FRONTEND_URL`（用於生成接受連結）

---

## 八、主要使用的 i18n Key（節選）

- 角色選項：`option.role.viewer|editor|manager`
- 列表欄位：`column.email`、`column.role`、`column.action`
- 說明文字：
  - `dialog.collaborators_description`
  - `dialog.global_collaborators_description`
- 通知訊息：`message.invitation.*`（sent/accepted/rejected/cancelled/...）

---

## 九、權限與驗證建議

- 僅專案擁有者或 manager 可對該專案新增/變更/移除協作者
- 全域協作者僅能由系統擁有者或具備相應權限之角色管理
- 接受邀請時，需確認 `invitee_email === 當前登入者 email`
- 重複邀請與過期處理：請在建立/接受前檢查資料庫狀態

---

## 十、常見問題（FAQ）

- 新增協作者後沒有立即看到名單？
  - 新流程走邀請制，對方接受前不會出現在協作者列表。
- 使用者點郵件卻無法開啟頁面？
  - 檢查 `FRONTEND_URL` 設定是否正確、token 是否過期。
- i18n 顯示未翻譯？
  - 確認對應 key 是否已在 `src/locales/module/*.json` 中補齊，並執行 `npm run locales:build`。

---

## 十一、未來優化

- 協作者權限細分（更細顆粒權限）
- 專案層級覆蓋全域預設的視覺提示與比對檢視
- 協作者活動記錄（加入/退出/變更角色）

---

## 十二、檔案總覽（與協作者相關）

- 前端
  - `src/components/core/dialog/CollaboratorDialog.vue`
  - `src/components/core/dialog/GlobalCollaboratorsDialog.vue`
  - `src/components/core/collaborator/CollaboratorManagement.vue`
  - `src/components/notification/InvitationNotifications.vue`
  - `src/composables/useCollaborators.ts`
  - `src/composables/useInvitations.ts`
  - `src/api/collaborator.ts`
  - `src/api/invitation.ts`
  - `src/types/collaborator.ts`
  - `src/types/invitation.ts`
  - `src/types/response.ts`

- 後端
  - `server/src/controllers/collaborator.ts`（如有）
  - `server/src/controllers/invitation.ts`
  - `server/src/routes/*`
  - `server/src/services/notification/email.service.ts`
  - `server/src/services/notification/templates/invitation.ts`

> 完整的邀請收發、頁面導流請參考 `INVITATION_SYSTEM.md`。
