'use client';

import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { resetPassword, verifyResetToken } from '@/lib/api/authApi';
import { useTranslation } from '@/providers/LanguageProvider';
import { Circle } from '../icons';

export default function ResetPasswordForm() {
  const { t } = useTranslation();

  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get('token') ?? '';
  const email = searchParams.get('email') ?? '';

  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [invalidReason, setInvalidReason] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const passwordsMatch = useMemo(
    () => password === confirmPassword,
    [password, confirmPassword],
  );

  const isPasswordValid = useMemo(
    () => password.trim().length >= 6,
    [password],
  );

  useEffect(() => {
    let isMounted = true;

    async function validateToken() {
      if (!email || !token) {
        if (!isMounted) return;
        setInvalidReason(t('auth.invalidResetLink'));
        setIsTokenValid(false);
        setIsCheckingToken(false);
        return;
      }

      try {
        const data = await verifyResetToken({ email, token });

        if (!isMounted) return;

        if (data.valid) {
          setIsTokenValid(true);
          setInvalidReason('');
        } else {
          setIsTokenValid(false);
          setInvalidReason(data.reason || t('auth.invalidResetToken'));
        }
      } catch (err: unknown) {
        if (!isMounted) return;

        const message =
          err instanceof Error ? err.message : t('messages.unexpectedError');

        setIsTokenValid(false);
        setInvalidReason(message);
      } finally {
        if (isMounted) {
          setIsCheckingToken(false);
        }
      }
    }

    validateToken();

    return () => {
      isMounted = false;
    };
  }, [email, token, t]);

  useEffect(() => {
    if (!success) return;

    const timeout = window.setTimeout(() => {
      router.push('/signin');
    }, 2000);

    return () => window.clearTimeout(timeout);
  }, [success, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !token) {
      setError(t('auth.invalidResetLink'));
      return;
    }

    if (!isPasswordValid) {
      setError(t('validation.passwordMinLength'));
      return;
    }

    if (!passwordsMatch) {
      setError(t('validation.passwordsDoNotMatch'));
      return;
    }

    try {
      setIsSubmitting(true);

      const data = await resetPassword({
        email,
        token,
        password,
      });

      const hasExplicitFailure = data.ok === false || data.success === false;

      if (hasExplicitFailure) {
        setError(data.error || t('messages.unexpectedError'));
        return;
      }

      setSuccess(data.message || t('auth.passwordResetSuccess'));
      setPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t('messages.unexpectedError');

      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCheckingToken) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <span className="flex flex-col">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="relative z-10 text-white">{t('auth.verifyingToken')}</p>
        </span>
      </div>
    );
  }

  if (!isTokenValid) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4">
        <div className="relative z-10 max-w-md rounded-xl bg-white p-6 text-center shadow-md">
          <h2 className="mb-2 text-xl font-semibold text-red-600">
            {t('auth.invalidLinkTitle')}
          </h2>
          <p className="text-gray-600">{invalidReason}</p>

          <Link
            href="/forgot-password"
            className="mt-4 inline-block font-bold text-blue-800 hover:underline"
          >
            {t('auth.sendNewResetLink')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md rounded-2xl bg-white/95 p-6 shadow-xl backdrop-blur-sm"
    >
      <h2 className="mb-5 text-start text-3xl font-bold text-black">
        {t('auth.resetPasswordTitle')}
      </h2>

      {error ? <p className="mb-3 text-sm text-red-500">{error}</p> : null}
      {success ? (
        <p className="mb-3 text-sm text-green-600">{success}</p>
      ) : null}

      <label className="mb-4 block">
        <span className="mb-1 block text-sm font-medium text-gray-700">
          {t('auth.newPassword')}
        </span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm outline-none transition focus:border-black text-black"
        />
      </label>

      <label className="mb-3 block">
        <span className="mb-1 block text-sm font-medium text-gray-700">
          {t('auth.confirmPassword')}
        </span>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm outline-none transition focus:border-black text-black"
        />
      </label>

      {!!confirmPassword && !passwordsMatch ? (
        <p className="mb-3 text-sm text-red-500">
          {t('validation.passwordsDoNotMatch')}
        </p>
      ) : null}

      {!!password && !isPasswordValid ? (
        <p className="mb-3 text-sm text-red-500">
          {t('validation.passwordMinLength')}
        </p>
      ) : null}

      <div className="mt-4 text-sm text-gray-600 mb-2 ml-1">
        {t('auth.rememberPassword')}{' '}
        <Link
          href="/signin"
          className="font-medium text-blue-600 hover:underline"
        >
          {t('auth.signInHere')}
        </Link>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full rounded-xl bg-black text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? t('common.submitting') : t('auth.saveNewPassword')}
      </button>
    </form>
  );
}
