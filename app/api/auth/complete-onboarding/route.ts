import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { UserRepository } from '@/lib/repository/UserRepository';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, password } = body;

    if (!userId || !password) {
      return NextResponse.json(
        { error: 'User ID and password are required.' },
        { status: 400 },
      );
    }

    const user = await UserRepository.findById(userId);
    if (!user || !user.mustChangePassword) {
      return NextResponse.json(
        { error: 'Invalid or expired link.' },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await UserRepository.update(userId, {
      password: hashedPassword,
      mustChangePassword: false,
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error('Error in complete-onboarding:', err);
    return NextResponse.json(
      { error: 'Failed to change password.' },
      { status: 500 },
    );
  }
}
