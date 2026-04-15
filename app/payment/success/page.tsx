'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { confirmPayment } from '@/lib/api/paymentApi';
import { useTranslation } from '@/providers/LanguageProvider';

type Status = 'loading' | 'success' | 'error';

function PaymentSuccessContent() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [status, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const reservationId = Number(searchParams.get('reservationId'));
      const paymentIntentId = searchParams.get('payment_intent') ?? '';
      const redirectStatus = searchParams.get('redirect_status');

      if (!reservationId || !paymentIntentId) {
        setErrorMessage(t('paymentSuccess.missingInfo'));
        setStatus('error');
        return;
      }

      if (redirectStatus !== 'succeeded') {
        setErrorMessage(t('paymentSuccess.notCompleted'));
        setStatus('error');
        return;
      }

      try {
        await confirmPayment({ reservationId, paymentIntentId, redirectStatus });
        setStatus('success');
      } catch (err: unknown) {
        setErrorMessage(
          err instanceof Error ? err.message : t('paymentSuccess.failedConfirm'),
        );
        setStatus('error');
      }
    };
    run();
  }, [searchParams, t]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/50">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          <h2 className="text-lg font-semibold text-slate-900">
            {t('paymentSuccess.confirmingTitle')}
          </h2>
          <p className="mt-2 text-sm text-slate-500">{t('paymentSuccess.wait')}</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-3xl border border-red-200 bg-white p-8 shadow-xl shadow-red-100/40">
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600 text-2xl">
            ✕
          </div>
          <h2 className="mb-2 text-2xl font-bold text-slate-900">
            {t('paymentSuccess.failedTitle')}
          </h2>
          <p className="mb-6 text-sm leading-6 text-slate-600">
            {errorMessage ?? t('paymentSuccess.fallbackError')}
          </p>
          <button
            onClick={() => router.push('/profile')}
            className="w-full rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            {t('paymentSuccess.backToProfile')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-xl shadow-emerald-100/40">
        <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 text-3xl">
          ✓
        </div>
        <h2 className="mb-2 text-2xl font-bold text-slate-900">
          {t('paymentSuccess.successTitle')}
        </h2>
        <p className="mb-6 text-sm leading-6 text-slate-500">
          {t('paymentSuccess.successText')}
        </p>
        <button
          onClick={() => router.push('/profile')}
          className="w-full rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          {t('paymentSuccess.goToProfile')}
        </button>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense>
      <PaymentSuccessContent />
    </Suspense>
  );
}
