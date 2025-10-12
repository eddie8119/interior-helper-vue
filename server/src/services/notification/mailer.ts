import nodemailer from 'nodemailer';

// Validate configuration early and log warnings
const requiredEnv = ['EMAIL_HOST', 'EMAIL_PORT', 'EMAIL_USER', 'EMAIL_PASSWORD', 'EMAIL_FROM'];
const missing = requiredEnv.filter((k) => !process.env[k]);
if (missing.length) {
  console.warn('[mailer] Missing environment variables:', missing.join(', '));
}

// Initialize a singleton transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify connection (skip in test)
if (process.env.NODE_ENV !== 'test') {
  transporter
    .verify()
    .then(() => console.log('[mailer] 郵件服務連接成功'))
    .catch((err) => console.error('[mailer] 郵件服務連接失敗:', err));
}

export const sendMail = async (options: nodemailer.SendMailOptions) => {
  try {
    const from = options.from || process.env.EMAIL_FROM;
    console.log('[mailer] Sending email', {
      to: options.to,
      subject: options.subject,
      from,
    });
    const info = await transporter.sendMail({ ...options, from });
    console.log('[mailer] Email sent', { messageId: info.messageId, response: info.response });
    return info;
  } catch (err) {
    console.error('[mailer] Failed to send email', err);
    throw err;
  }
};

export const getTransporter = () => transporter;
