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
    .catch((err) => console.error('[mailer] 郵件服務連接失敗:', err));
}

export const sendMail = async (options: nodemailer.SendMailOptions) => {
  try {
    const from = options.from || process.env.EMAIL_FROM;
    const info = await transporter.sendMail({ ...options, from });
    return info;
  } catch (err) {
    console.error('[mailer] Failed to send email', err);
    throw err;
  }
};

export const getTransporter = () => transporter;
