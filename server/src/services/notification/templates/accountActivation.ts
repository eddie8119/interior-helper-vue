import { footerBlock } from './partials/footer';
import { headerBlock } from './partials/header';
import { container } from '../../utils/email';

interface AccountActivationData {
  email: string;
  activationLink: string;
  expiresIn?: string;
  userName?: string;
}

/**
 * 生成帳戶激活郵件模板
 */
export const generateAccountActivationTemplate = (data: AccountActivationData): string => {
  const { email, activationLink, expiresIn = '24 小時', userName = '用戶' } = data;

  const inner = `
    ${headerBlock('驗證您的電子郵件')}
    
    <div style="margin: 20px 0; padding: 20px; background-color: #e3f2fd; border-left: 4px solid #2196f3; border-radius: 8px;">
      <h2 style="margin-top: 0; color: #1565c0; font-size: 24px;">✉️ 驗證您的電子郵件地址</h2>
      
      <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">
        親愛的 ${userName}，
      </p>
      
      <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">
        感謝您註冊 HSWE IoT 帳戶！為了完成註冊流程，請驗證您的電子郵件地址。
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${activationLink}" 
           style="display: inline-block; padding: 14px 32px; background-color: #2196f3; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
          驗證電子郵件
        </a>
      </div>
      
      <p style="color: #777; font-size: 14px; line-height: 1.6; margin-bottom: 10px;">
        或複製以下連結到瀏覽器：
      </p>
      <p style="color: #2196f3; font-size: 13px; word-break: break-all; background-color: #fff; padding: 10px; border-radius: 4px; border: 1px solid #ddd;">
        ${activationLink}
      </p>
      
      <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #ddd;">
        <p style="color: #999; font-size: 13px; line-height: 1.6; margin: 5px 0;">
          <strong>⏰ 此連結將在 ${expiresIn} 後過期</strong>
        </p>
        <p style="color: #999; font-size: 13px; line-height: 1.6; margin: 5px 0;">
          📧 此郵件發送至：${email}
        </p>
      </div>
    </div>
    
    <div style="margin: 20px 0; padding: 15px; background-color: #f0f4c3; border-left: 4px solid #cddc39; border-radius: 4px;">
      <p style="color: #558b2f; font-size: 14px; margin: 0; line-height: 1.6;">
        <strong>💡 提示：</strong><br>
        如果您沒有建立此帳戶，請忽略此郵件。
      </p>
    </div>
    
    ${footerBlock()}
  `;

  return container(inner);
};
