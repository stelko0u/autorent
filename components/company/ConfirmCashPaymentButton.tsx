'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useTranslation } from '@/providers/LanguageProvider';

interface ConfirmCashPaymentButtonProps {
  reservationId: number;
  initialPaymentStatus: string;
  initialReservationStatus: string;
}

type CashPaymentResponse = {
  ok: boolean;
  error?: string;
  invoiceEmailSent?: boolean;
  invoiceWarning?: string | null;
};

export function ConfirmCashPaymentButton({
  reservationId,
  initialPaymentStatus,
  initialReservationStatus,
}: ConfirmCashPaymentButtonProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus);
  const [reservationStatus, setReservationStatus] = useState(
    initialReservationStatus,
  );

  const shouldShowButton = useMemo(() => {
    return paymentStatus !== 'PAID' && reservationStatus !== 'CANCELLED';
  }, [paymentStatus, reservationStatus]);

  const handleClick = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(
        `/api/company/reservations/${reservationId}/cash-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      const data: CashPaymentResponse =
        (await response.json()) as CashPaymentResponse;

      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? t('confirmCashPayment.failedConfirm'));
      }

      setPaymentStatus('PAID');
      setReservationStatus((currentStatus) =>
        currentStatus === 'PENDING' || currentStatus === 'CONFIRMED'
          ? 'IN_PROGRESS'
          : currentStatus,
      );

      if (data.invoiceEmailSent) {
        toast.success(
          t('confirmCashPayment.confirmedAndSent'),
        );
      } else if (data.invoiceWarning) {
        toast.success(t('confirmCashPayment.confirmed'));
        toast.warning(
          `${t('confirmCashPayment.invoiceNotSent')}: ${data.invoiceWarning}`,
        );
      } else {
        toast.success(t('confirmCashPayment.confirmed'));
      }

      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : t('confirmCashPayment.genericError');

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!shouldShowButton) {
    return (
      <span className="inline-flex w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
        {t('confirmCashPayment.paid')}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isLoading}
      className="inline-flex items-center  justify-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isLoading ? t('confirmCashPayment.waiting') : t('confirmCashPayment.confirmPaid')}
    </button>
  );
}
