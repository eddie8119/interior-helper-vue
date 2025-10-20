import { footerBlock } from './partials/footer';
import { headerBlock } from './partials/header';
import { container } from '../../utils/email';

interface PasswordResetData {
  email: string;
  resetLink: string;
  expiresIn?: string;
}

/**
 * 生成密碼重置郵件模板
 */
export const generatePasswordResetTemplate = (data: PasswordResetData): string => {
  const { email, resetLink, expiresIn = '1 小時' } = data;

  const inner = `
    ${headerBlock('重置密碼')}
    
    <div style="margin: 20px 0; padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
      <h2 style="margin-top: 0; color: #2c3e50; font-size: 24px;">重置您的密碼</h2>
      
      <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">
        您好，
      </p>
      
      <p style="color: #555; line-height: 1.6; margin-bottom: 15px;">
        我們收到了您的密碼重置請求。請點擊下方按鈕來重置您的密碼：
      </p>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetLink}" 
           style="display: inline-block; padding: 14px 32px; background-color: #3498db; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
          重置密碼
        </a>
      </div>
      
      <p style="color: #777; font-size: 14px; line-height: 1.6; margin-bottom: 10px;">
        或複製以下連結到瀏覽器：
      </p>
      <p style="color: #3498db; font-size: 14px; word-break: break-all; background-color: #fff; padding: 10px; border-radius: 4px; border: 1px solid #ddd;">
        ${resetLink}
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
    
    <div style="margin: 20px 0; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 4px;">
      <p style="color: #856404; font-size: 14px; margin: 0; line-height: 1.6;">
        <strong>⚠️ 安全提示：</strong><br>
        如果您沒有要求重置密碼，請忽略此郵件。您的密碼不會被更改。
      </p>
    </div>
    
    ${footerBlock()}
  `;

  return container(inner);
};

/**
 * 生成密碼更改成功通知郵件模板
 */
export const generatePasswordChangedTemplate = (email: string): string => {
  const inner = `
    ${headerBlock('密碼已更改')}
    
    <div style="margin: 20px 0; padding: 20px; background-color: #d4edda; border-left: 4px solid #28a745; border-radius: 4px;">
      <h2 style="margin-top: 0; color: #155724; font-size: 24px;">✓ 密碼更改成功</h2>
      
      <p style="color: #155724; line-height: 1.6; margin-bottom: 15px;">
        您好，
      </p>
      
      <p style="color: #155724; line-height: 1.6; margin-bottom: 15px;">
        您的帳戶密碼已成功更改。
      </p>
      
      <div style="margin-top: 20px; padding: 15px; background-color: #fff; border-radius: 4px;">
        <p style="color: #555; font-size: 14px; margin: 5px 0;">
          📧 帳戶：${email}
        </p>
        <p style="color: #555; font-size: 14px; margin: 5px 0;">
          🕐 更改時間：${new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' })}
        </p>
      </div>
    </div>
    
    <div style="margin: 20px 0; padding: 15px; background-color: #f8d7da; border-left: 4px solid #dc3545; border-radius: 4px;">
      <p style="color: #721c24; font-size: 14px; margin: 0; line-height: 1.6;">
        <strong>🔒 如果這不是您的操作：</strong><br>
        請立即聯繫我們的客服團隊，您的帳戶可能已被盜用。
      </p>
    </div>
    
    ${footerBlock()}
  `;

  return container(inner);
};
