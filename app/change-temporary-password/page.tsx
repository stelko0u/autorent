'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { completeOnboarding } from '@/lib/api/authApi';
import authbg from 'public/authbg.jpg';

function ChangeTemporaryPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const userId = searchParams.get('userId');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!userId) {
      setError('Invalid or missing user ID.');
    }
  }, [userId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!userId) {
      setError('Invalid or missing user ID.');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await completeOnboarding({
        userId,
        password,
      });

      setSuccess('Password has been successfully changed!');

      setTimeout(() => {
        router.push('/signin');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error changing password.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <div className="absolute inset-0 -z-10 bg-black overflow-hidden">
        <Image
          src={authbg}
          alt=""
          fill
          priority
          className="object-cover blur-sm scale-105"
        />
        <div className="absolute inset-0 bg-black/25" />
      </div>

      {!userId ? (
        <div className="mx-auto w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-red-600">Invalid link</h1>
            <p className="mt-2 text-sm text-gray-600">
              The link is invalid or expired.
            </p>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Go back to{' '}
            <Link
              href="/signin"
              className="font-medium text-blue-600 hover:underline"
            >
              Sign In
            </Link>
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              Change Temporary Password
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Enter your new password below to complete your account setup.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                New Password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm text-black outline-none transition focus:border-black"
                placeholder="Enter new password"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="h-11 w-full rounded-xl border border-gray-300 px-3 text-sm text-black outline-none transition focus:border-black"
                placeholder="Confirm new password"
                required
              />
            </div>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {success ? (
              <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                {success}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl bg-black text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Submitting...' : 'Save New Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default function ChangeTemporaryPasswordPage() {
  return (
    <Suspense>
      <ChangeTemporaryPasswordForm />
    </Suspense>
  );
}
