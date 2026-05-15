import { NextResponse } from 'next/server';
import { UserRepository } from '@/lib/repository/UserRepository';
import { sendVerificationEmail } from '@/lib/mail/sendVerificationEmail';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { email, locale: bodyLocale } = await req.json();
    const localeCookie = req.headers
      .get('cookie')
      ?.split(';')
      .map((item) => item.trim())
      .find((item) => item.startsWith('locale='))
      ?.split('=')[1];
    const localeHeader = req.headers.get('x-locale');
    const locale =
      bodyLocale === 'en'
        ? 'en'
        : localeHeader === 'en'
          ? 'en'
          : localeCookie === 'en'
            ? 'en'
            : 'bg';

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Invalid email address.' },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await UserRepository.findByEmail(normalizedEmail);

    if (!user) {
      return NextResponse.json(
        { error: 'No user found with this email.' },
        { status: 404 },
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email is already verified.' },
        { status: 400 },
      );
    }

    await sendVerificationEmail(user.email, user.id, user.name, locale);

    return NextResponse.json({
      success: true,
      message: 'Verification email sent.',
    });
  } catch (err: unknown) {
    console.error('resend-verification API error:', err);

    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV !== 'production'
            ? err instanceof Error
              ? err.message
              : 'Unknown error'
            : 'Internal server error.',
      },
      { status: 500 },
    );
  }
}
