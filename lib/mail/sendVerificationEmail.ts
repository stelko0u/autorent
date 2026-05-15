import jwt from 'jsonwebtoken';
import { sendMail } from '@/lib/mail/mailer';
import { getConfirmEmailTemplate } from '@/lib/mail/templates/confirmEmailTemplate';
import { getEmailTranslations } from '@/lib/i18n/emailTranslations';

const JWT_SECRET = process.env.JWT_SECRET;

function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.SITE_URL ??
    'http://localhost:3000'
  );
}

export async function sendVerificationEmail(
  email: string,
  userId: number,
  userName?: string | null,
  locale: 'bg' | 'en' = 'bg',
) {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET not configured');
  }

  const token = jwt.sign({ userId, type: 'verify-email' }, JWT_SECRET, {
    expiresIn: '24h',
    subject: String(userId),
  });

  const appUrl = getAppUrl();
  const verifyUrl = `${appUrl}/api/auth/verify?token=${encodeURIComponent(
    token,
  )}`;
  const copy = getEmailTranslations(locale).verification;

  await sendMail({
    to: email,
    subject: copy.subject,
    text: `${copy.title}: ${verifyUrl}`,
    html: getConfirmEmailTemplate({
      verifyUrl,
      appName: 'SmartRent',
      userName,
      locale,
    }),
  });
}
