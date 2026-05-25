import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { ZodError } from 'zod';
import { UserRepository } from '@/lib/repository/UserRepository';
import { sendVerificationEmail } from '@/lib/mail/sendVerificationEmail';
import { getZodErrorCode, signupSchema } from '@/lib/validators/schemas';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const rawBody = await req.json();
    const body = signupSchema.parse(rawBody);
    const localeCookie = req.headers
      .get('cookie')
      ?.split(';')
      .map((item) => item.trim())
      .find((item) => item.startsWith('locale='))
      ?.split('=')[1];
    const localeHeader = req.headers.get('x-locale');
    const locale =
      body.locale === 'en'
        ? 'en'
        : localeHeader === 'en'
          ? 'en'
          : localeCookie === 'en'
            ? 'en'
            : 'bg';
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      address,
      city,
      country,
      postalCode,
      dateOfBirth,
    } = body;

    const dob = new Date(dateOfBirth);

    const existing = await UserRepository.findByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: 'Unable to create account' },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await UserRepository.create({
      email,
      password: hashedPassword,
      phone,
      address,
      city,
      country,
      postalCode,
      dateOfBirth: dob,
      name: `${firstName} ${lastName}`,
      emailVerified: false,
      mustChangePassword: false,
      role: 'USER',
    });

    try {
      await sendVerificationEmail(user.email, user.id, user.name, locale);
    } catch (sendErr) {
      console.error('sendVerificationEmail failed:', sendErr);
    }

    return NextResponse.json(
      {
        ok: true,
        message:
          'Registration successful. Please check your email to verify your account.',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          phone: user.phone,
          address: user.address,
          city: user.city,
          country: user.country,
          postalCode: user.postalCode,
          dateOfBirth: user.dateOfBirth,
          emailVerified: user.emailVerified,
        },
      },
      { status: 201 },
    );
  } catch (err: unknown) {
    console.error('POST /api/auth/signup error:', err);

    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: getZodErrorCode(err) },
        { status: 400 },
      );
    }

    const message = err instanceof Error ? err.message : 'Server error';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
