import { getEmailTranslations } from '@/lib/i18n/emailTranslations';

type ResetPasswordTemplateInput = {
  resetLink: string;
  locale?: 'bg' | 'en';
};

export function getResetPasswordEmailTemplate({
  resetLink,
  locale = 'bg',
}: ResetPasswordTemplateInput) {
  const isEnglish = locale === 'en';
  const copy = getEmailTranslations(locale).resetPassword;
  const title = copy.title;
  const greeting = `${copy.greeting},`;
  const intro = copy.intro;
  const cta = copy.cta;
  const fallback = copy.fallback;
  const ignore = copy.ignore;
  const signature = copy.signature;

  return `
<!DOCTYPE html>
<html lang="${isEnglish ? 'en' : 'bg'}">
<head>
  <meta charset="UTF-8" />
  <title>${isEnglish ? 'Password reset - SmartRent' : 'Нулиране на парола - SmartRent'}</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f6f8; font-family:Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" style="padding:40px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 8px 24px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:#111827; padding:24px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:24px;">SmartRent</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h2 style="margin-top:0; color:#111827; font-size:20px;">${title}</h2>
              <p style="color:#374151; font-size:15px; line-height:1.6;">${greeting}</p>
              <p style="color:#374151; font-size:15px; line-height:1.6;">
                ${intro}
              </p>
              <div style="text-align:center; margin:32px 0;">
                <a href="${resetLink}"
                   style="display:inline-block; background:#2563eb; color:#ffffff; padding:14px 28px; font-size:16px; font-weight:600; text-decoration:none; border-radius:8px;">
                  ${cta}
                </a>
              </div>
              <p style="color:#6b7280; font-size:14px; line-height:1.6;">
                ${fallback}
              </p>
              <p style="word-break:break-all; color:#2563eb; font-size:14px;">
                <a href="${resetLink}" style="color:#2563eb; text-decoration:none;">
                  ${resetLink}
                </a>
              </p>
              <p style="color:#6b7280; font-size:14px; line-height:1.6; margin-top:24px;">
                ${ignore}
              </p>
              <p style="color:#374151; font-size:14px; margin-top:32px;">
                ${isEnglish ? 'Regards,' : 'Поздрави,'}<br />
                <strong>${signature}</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#f9fafb; padding:20px; text-align:center;">
              <p style="margin:0; font-size:12px; color:#9ca3af;">
                © ${new Date().getFullYear()} SmartRent. ${isEnglish ? 'All rights reserved.' : 'Всички права запазени.'}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
}
