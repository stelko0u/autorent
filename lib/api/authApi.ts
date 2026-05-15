export type MeResponse = {
  ok?: boolean;
  user?: {
    id: number;
    banned?: boolean;
    banReason?: string | null;
    bannedAt?: string | null;
  } | null;
};

export interface VerifyResetTokenPayload {
  email: string;
  token: string;
}

export interface VerifyResetTokenResponse {
  valid: boolean;
  reason?: string;
}

export interface ResetPasswordPayload {
  email: string;
  token: string;
  password: string;
}

export interface ResetPasswordResponse {
  ok?: boolean;
  success?: boolean;
  message?: string;
  error?: string;
}

export type CompleteOnboardingPayload = {
  userId: string;
  password: string;
};

export type CompleteOnboardingResponse = {
  ok?: boolean;
  error?: string;
  message?: string;
};

export interface SignUpPayload {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
}

export interface AuthResponse {
  ok: boolean;
  error?: string;
}

export interface ForgotPasswordPayload {
  email: string;
  locale?: 'bg' | 'en';
}

export interface ForgotPasswordResponse {
  ok?: boolean;
  success?: boolean;
  message?: string;
  error?: string;
}

export type SignInResponse =
  | {
      ok: true;
      redirectTo?: string;
      user?: {
        id: number;
        email: string;
        name: string | null;
        role: 'USER' | 'ADMIN' | 'COMPANY' | null;
        companyId: number | null;
        banned: boolean;
        banReason: string | null;
        bannedAt: string | null;
      };
    }
  | {
      ok: false;
      error?: string;
      mustChangePassword?: boolean;
      redirectTo?: string;
    };

function getBrowserLocale(): 'bg' | 'en' {
  if (typeof document !== 'undefined') {
    const localeCookie = document.cookie
      .split(';')
      .map((item) => item.trim())
      .find((item) => item.startsWith('locale='))
      ?.split('=')[1];

    if (localeCookie === 'en' || localeCookie === 'bg') {
      return localeCookie;
    }
  }

  if (typeof window !== 'undefined') {
    const savedLocale = window.localStorage.getItem('locale');

    if (savedLocale === 'en' || savedLocale === 'bg') {
      return savedLocale;
    }
  }

  return 'bg';
}

export async function getCurrentUser(): Promise<MeResponse> {
  const res = await fetch('/api/auth/me', {
    credentials: 'include',
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch current user');
  }

  return res.json();
}

export async function signOutUser(): Promise<void> {
  const res = await fetch('/api/auth/signout', {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Failed to sign out');
  }
}

export async function completeOnboarding(
  payload: CompleteOnboardingPayload,
): Promise<CompleteOnboardingResponse> {
  const res = await fetch('/api/auth/complete-onboarding', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data?.error || 'Error changing password.');
  }

  return data;
}

export async function signUp(data: SignUpPayload): Promise<AuthResponse> {
  const locale = getBrowserLocale();
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-locale': locale,
    },
    body: JSON.stringify({ ...data, locale }),
  });

  return res.json();
}

export async function signIn(
  email: string,
  password: string,
): Promise<SignInResponse> {
  const res = await fetch('/api/auth/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  const data: SignInResponse = await res.json().catch(() => ({
    ok: false,
    error: 'server_error',
  }));

  return data;
}

export async function signOut(): Promise<void> {
  await fetch('/api/auth/signout', {
    method: 'POST',
  });
}

export async function forgotPassword(
  payload: ForgotPasswordPayload,
): Promise<ForgotPasswordResponse> {
  const locale = payload.locale ?? getBrowserLocale();
  const response = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-locale': locale,
    },
    body: JSON.stringify({ ...payload, locale }),
  });

  const data: ForgotPasswordResponse = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
}

export async function verifyResetToken(
  payload: VerifyResetTokenPayload,
): Promise<VerifyResetTokenResponse> {
  const response = await fetch('/api/auth/verify-reset-token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data: VerifyResetTokenResponse = await response.json().catch(() => ({
    valid: false,
    reason: 'Request failed',
  }));

  if (!response.ok) {
    throw new Error(data.reason || 'Failed to verify reset token');
  }

  return data;
}

export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<ResetPasswordResponse> {
  const response = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data: ResetPasswordResponse = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || 'Failed to reset password');
  }

  return data;
}
