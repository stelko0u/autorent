import { createTransporter } from '@/lib/mail/mailer';
import { getEmailTranslations } from '@/lib/i18n/emailTranslations';

type SendCompanyCredentialsEmailInput = {
  companyName: string;
  loginEmail: string;
  temporaryPassword: string;
  to: string;
  locale?: 'bg' | 'en';
};

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export async function sendCompanyCredentialsEmail(
  input: SendCompanyCredentialsEmailInput,
) {
  const from =
    process.env.EMAIL_FROM ?? process.env.SMTP_FROM ?? process.env.SMTP_USER;

  if (!from) {
    throw new Error('smtp_from_not_configured');
  }

  const formattedFrom = from.includes('<') ? from : `SmartRent <${from}>`;

  const devOverride = process.env.DEV_ONBOARDING_EMAIL_OVERRIDE?.trim();
  const to =
    process.env.NODE_ENV !== 'production' && devOverride
      ? devOverride
      : input.to;

  const transporter = createTransporter();
  const locale = input.locale === 'en' ? 'en' : 'bg';
  const copy = getEmailTranslations(locale).companyCredentials;

  const safeCompanyName = escapeHtml(input.companyName);
  const safeLoginEmail = escapeHtml(input.loginEmail);
  const safeTemporaryPassword = escapeHtml(input.temporaryPassword);
  const loginUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.SITE_URL ??
    'http://localhost:3000';

  await transporter.sendMail({
    from: formattedFrom,
    to,
    subject: copy.subject,
    text: [
      `${copy.greeting},`,
      '',
      copy.intro(input.companyName),
      `${copy.loginEmailLabel}: ${input.loginEmail}`,
      `${copy.passwordLabel}: ${input.temporaryPassword}`,
      '',
      copy.note,
      '',
      locale === 'en' ? 'Regards,' : 'Поздрави,',
      'SmartRent',
    ].join('\n'),
    html: `
      <!DOCTYPE html>
      <html lang="${locale}">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${copy.title}</title>
      </head>
      <body style="margin:0;padding:0;background:#eef2f7;font-family:Arial,Helvetica,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="padding:38px 12px;background:#eef2f7;">
          <tr>
            <td align="center">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:640px;background:#ffffff;border-radius:18px;overflow:hidden;box-shadow:0 16px 42px rgba(15,23,42,0.14);">
                <tr>
                  <td style="background:#111827;padding:30px 30px 26px;text-align:left;color:#ffffff;">
                    <div style="font-size:13px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#93c5fd;margin-bottom:12px;">SmartRent</div>
                    <h1 style="margin:0;font-size:28px;line-height:1.2;font-weight:800;">${copy.title}</h1>
                    <p style="margin:12px 0 0;font-size:15px;line-height:1.6;color:#d1d5db;">${copy.intro(safeCompanyName)}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px 30px;">
                    <p style="margin:0 0 18px;color:#374151;font-size:15px;line-height:1.7;">
                      ${copy.greeting},
                    </p>
                    <div style="background:#f8fafc;border:1px solid #dbe3ef;border-radius:14px;padding:20px;margin:0 0 22px 0;">
                      <p style="margin:0 0 14px;font-size:13px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#64748b;">${locale === 'en' ? 'Sign-in details' : 'Данни за вход'}</p>
                      <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                          <td style="padding:10px 0;color:#64748b;font-size:14px;">${copy.loginEmailLabel}</td>
                          <td style="padding:10px 0;color:#111827;font-size:15px;font-weight:700;text-align:right;">${safeLoginEmail}</td>
                        </tr>
                        <tr>
                          <td style="padding:10px 0;color:#64748b;font-size:14px;border-top:1px solid #e5e7eb;">${copy.passwordLabel}</td>
                          <td style="padding:10px 0;color:#111827;font-size:16px;font-weight:800;text-align:right;border-top:1px solid #e5e7eb;font-family:Consolas,Monaco,monospace;">${safeTemporaryPassword}</td>
                        </tr>
                      </table>
                    </div>
                    <p style="margin:0 0 22px;color:#92400e;font-size:14px;line-height:1.6;background:#fffbeb;border:1px solid #fcd34d;padding:13px 15px;border-radius:12px;">
                      ${copy.note}
                    </p>
                    <div style="text-align:center;margin:28px 0 10px;">
                      <a href="${loginUrl}/signin" style="display:inline-block;background:#2563eb;color:#ffffff;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
                        ${copy.ctaLabel}
                      </a>
                    </div>
                    <p style="margin:16px 0 0;color:#6b7280;font-size:13px;line-height:1.6;text-align:center;">
                      ${copy.footer}
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#f9fafb;padding:18px;text-align:center;">
                    <p style="margin:0;color:#9ca3af;font-size:12px;">© ${new Date().getFullYear()} SmartRent. ${locale === 'en' ? 'All rights reserved.' : 'Всички права запазени.'}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  });

  return {
    sentTo: to,
    originalRecipient: input.to,
    devOverrideUsed: to !== input.to,
  };
}
