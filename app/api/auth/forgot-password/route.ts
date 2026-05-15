import { NextResponse } from 'next/server';
import { sendForgotPasswordEmail } from '@/lib/services/auth/forgotPasswordService';
import type { Locale } from '@/lib/i18n/translations';

type ReqBody = {
  email?: string;
  locale?: 'bg' | 'en';
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ReqBody;
    const email = typeof body.email === 'string' ? body.email : '';
    const localeCookie = req.headers
      .get('cookie')
      ?.split(';')
      .map((item) => item.trim())
      .find((item) => item.startsWith('locale='))
      ?.split('=')[1];
    const localeHeader = req.headers.get('x-locale');
    const locale: Locale =
      body.locale === 'en'
        ? 'en'
        : localeHeader === 'en'
          ? 'en'
          : localeCookie === 'en'
            ? 'en'
            : 'bg';

    if (!email.trim()) {
      return NextResponse.json(
        { error: 'Email is required.' },
        { status: 400 },
      );
    }

    const result = await sendForgotPasswordEmail(email, locale);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('POST /api/auth/forgot-password error:', error);
    return NextResponse.json(
      { error: 'Internal server error.' },
      { status: 500 },
    );
  }
}
