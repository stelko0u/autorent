import crypto from 'crypto';
import { UserRepository } from '@/lib/repository/UserRepository';
import { PasswordResetTokenRepository } from '@/lib/repository/PasswordResetTokenRepository';
import { getResetPasswordEmailTemplate } from '@/lib/mail/templates/resetPasswordTemplate';
import type { Locale } from '@/lib/i18n/translations';
import { getEmailTranslations } from '@/lib/i18n/emailTranslations';
import { isValidEmail, normalizeEmail } from '@/lib/utils/email';
import { sendMail } from '@/lib/mail/sendMail';

export async function sendForgotPasswordEmail(
  rawEmail: string,
  locale: Locale = 'bg',
) {
  const normalizedEmail = normalizeEmail(rawEmail);

  if (!isValidEmail(normalizedEmail)) {
    throw new Error('INVALID_EMAIL');
  }

  const user = await UserRepository.findByEmail(normalizedEmail);

  if (!user) {
    return {
      ok: true,
      success: true,
      message: 'Ако съществува акаунт с този имейл, ще получиш инструкции.',
    };
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const id = crypto.randomBytes(16).toString('hex');
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60);

  await PasswordResetTokenRepository.deleteByEmail(normalizedEmail);

  await PasswordResetTokenRepository.create({
    id,
    email: normalizedEmail,
    token: tokenHash,
    expiresAt,
  });

  const host =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.SITE_URL ??
    'http://localhost:3000';

  const resetLink = `${host}/reset-password?token=${rawToken}&email=${encodeURIComponent(
    normalizedEmail,
  )}`;
  const copy = getEmailTranslations(locale).resetPassword;

  await sendMail({
    to: normalizedEmail,
    subject: copy.subject,
    text:
      locale === 'en'
        ? `Open this link to set a new password: ${resetLink}`
        : `Отвори този линк, за да зададеш нова парола: ${resetLink}`,
    html: getResetPasswordEmailTemplate({ resetLink, locale }),
  });

  return {
    ok: true,
    success: true,
    message: 'Ако съществува акаунт с този имейл, ще получиш инструкции.',
  };
}
