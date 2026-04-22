'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useRouter } from 'next/navigation';
import { createPaymentIntent } from '@/lib/api/paymentApi';
import LoadingCircle from '../icons/LoadingCircle';
import { useTranslation } from '@/providers/LanguageProvider';

type CheckoutFormProps = {
  reservationId: number;
};

type PaymentIntentState = {
  clientSecret: string | null;
  amount: number | null;
};

export default function CheckoutForm({ reservationId }: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { t } = useTranslation();

  const [paymentIntent, setPaymentIntent] = useState<PaymentIntentState>({
    clientSecret: null,
    amount: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reservationId) {
      setLoading(false);
      setError(t('paymentForm.invalidReservation'));
      return;
    }

    let isActive = true;

    const loadPaymentIntent = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await createPaymentIntent(reservationId);

        if (!isActive) {
          return;
        }

        setPaymentIntent({
          clientSecret: data.clientSecret,
          amount: data.amount,
        });
      } catch (err: unknown) {
        if (!isActive) {
          return;
        }

        const message =
          err instanceof Error
            ? err.message
            : t('paymentForm.failedInitialize');

        setError(message);
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    void loadPaymentIntent();

    return () => {
      isActive = false;
    };
  }, [reservationId, t]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!stripe || !elements || !paymentIntent.clientSecret) {
      setError(t('paymentForm.notReady'));
      return;
    }

    const card = elements.getElement(CardElement);

    if (!card) {
      setError(t('paymentForm.cardNotLoaded'));
      return;
    }

    try {
      setProcessing(true);

      const result = await stripe.confirmCardPayment(
        paymentIntent.clientSecret,
        {
          payment_method: {
            card,
          },
        },
      );

      if (result.error) {
        setError(result.error.message || t('paymentForm.paymentFailed'));
        return;
      }

      if (result.paymentIntent?.status === 'succeeded') {
        router.push(
          `/payment/success?reservationId=${reservationId}&payment_intent=${result.paymentIntent.id}&redirect_status=succeeded`,
        );
        return;
      }

      setError(t('paymentForm.notCompleted'));
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : t('paymentForm.paymentFailed');

      setError(message);
    } finally {
      setProcessing(false);
    }
  };

  const cardOptions = useMemo(
    () => ({
      hidePostalCode: true,
      style: {
        base: {
          fontSize: '16px',
          color: '#1f2937',
          '::placeholder': {
            color: '#9ca3af',
          },
        },
        invalid: {
          color: '#ef4444',
        },
      },
    }),
    [],
  );

  const submitDisabled =
    loading || processing || !stripe || !paymentIntent.clientSecret;

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {paymentIntent.amount !== null && (
        <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-700">
              {t('paymentForm.totalAmount')}:
            </span>
            <span className="text-2xl font-bold text-indigo-600">
              €{paymentIntent.amount}
            </span>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {t('paymentForm.cardDetails')}
        </label>
        <CardElement options={cardOptions} />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitDisabled}
        className="w-full rounded-xl bg-indigo-600 px-6 py-4 font-semibold text-white transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-400"
      >
        {processing ? (
          <span className="flex items-center justify-center gap-2">
            <LoadingCircle className="h-5 w-5 animate-spin" />
            {t('paymentForm.processing')}
          </span>
        ) : (
          `${t('paymentForm.pay')} €${paymentIntent.amount ?? '0.00'}`
        )}
      </button>

      <p className="text-center text-xs text-gray-500">
        {t('paymentForm.securedByStripe')}
      </p>
    </form>
  );
}
