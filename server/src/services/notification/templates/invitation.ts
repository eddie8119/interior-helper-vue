import { headerBlock } from '../templates/partials/header';
import { footerBlock } from '../templates/partials/footer';
import { container, roleNameMap } from '../../utils/email';

export const generateInvitationTemplate = (
  inviterName: string,
  invitationType: 'project' | 'global',
  role: string,
  acceptUrl: string,
  projectName?: string
): string => {
  const invitationTitle =
    invitationType === 'project'
      ? `邀請您成為專案「${projectName}」的協作者`
      : '邀請您成為全域專案協作者';

  const invitationDescription =
    invitationType === 'project'
      ? `您將可以以「${roleNameMap[role] || role}」的身份訪問和管理該專案。`
      : `您將可以以「${roleNameMap[role] || role}」的身份訪問所有專案。`;

  const inner = `
    ${headerBlock('協作邀請')}
    <div style="margin: 20px 0; padding: 20px; background-color: #f9f9f9; border-radius: 5px;">
      <p style="color: #333; font-size: 16px; margin-bottom: 15px;">
        <strong>${inviterName}</strong> ${invitationTitle}
      </p>
      <p style="color: #555; margin-bottom: 10px;">
        ${invitationDescription}
      </p>
      <div style="margin: 10px 0; padding: 10px; background-color: #e8f4f8; border-left: 3px solid #3498db; border-radius: 3px;">
        <p style="color: #2980b9; margin: 0; font-size: 14px;">
          <strong>角色權限：${roleNameMap[role] || role}</strong>
        </p>
      </div>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${acceptUrl}" 
         style="display: inline-block; padding: 12px 30px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
        接受邀請
      </a>
    </div>

    <div style="margin: 20px 0; padding: 15px; background-color: #fff3cd; border-radius: 5px; border: 1px solid #ffc107;">
      <p style="color: #856404; margin: 0; font-size: 14px;">
        <strong>注意：</strong>如果您尚未註冊帳號，點擊接受邀請後將引導您完成註冊流程。
      </p>
    </div>

    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
      <p style="color: #777; font-size: 13px; margin-bottom: 10px;">
        此邀請將在 7 天後過期。如果您不想接受此邀請，可以忽略此郵件。
      </p>
    </div>

    ${footerBlock()}
  `;

  return container(inner);
};
