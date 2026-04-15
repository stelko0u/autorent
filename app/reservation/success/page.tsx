'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import Successfully from '../../../components/icons/Check';
import { TriangleExclamation } from '@/components/icons';
import { useTranslation } from '@/providers/LanguageProvider';

function ReservationSuccessContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const reservationId = searchParams.get('id');
  const step = searchParams.get('step');

  const isConfirmed = step === 'confirmed';
  const isCheckEmail = step === 'check-email';
  const isCreated = step === 'created';

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 to-blue-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-300 mb-6 animate-bounce">
          <Successfully className="w-8 h-8 text-white" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          {isConfirmed
            ? t('reservationSuccess.confirmedTitle')
            : isCheckEmail
              ? t('reservationSuccess.createdTitle')
              : t('reservationSuccess.sentTitle')}
        </h1>

        {isCheckEmail && (
          <div className="mb-6">
            <p className="text-gray-700 text-lg mb-2">
              {t('reservationSuccess.checkEmailLine1')}
            </p>
            <p className="text-gray-600 text-sm">
              {t('reservationSuccess.checkEmailLine2')}
            </p>
          </div>
        )}

        {isCreated && (
          <div className="mb-6">
            <p className="text-gray-700 text-lg mb-2">
              {t('reservationSuccess.createdLine1')}
            </p>
            <p className="text-gray-600 text-sm">
              {t('reservationSuccess.createdLine2')}
            </p>
          </div>
        )}

        {isConfirmed && (
          <div className="mb-6">
            <p className="text-gray-700 text-lg mb-2">
              {t('reservationSuccess.confirmedLine1')}
            </p>
            <p className="text-gray-600 text-sm">
              {t('reservationSuccess.confirmedLine2')}
            </p>
          </div>
        )}

        {reservationId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">
              {t('reservationSuccess.reservationNumber')}
            </p>
            <p className="text-2xl font-bold text-indigo-600">
              #{reservationId}
            </p>
          </div>
        )}

        {isCheckEmail && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 text-left">
            <div className="flex">
              <div className="shrink-0">
                <TriangleExclamation
                  className="h-5 w-5 text-yellow-400"
                  aria-hidden="true"
                />
              </div>

              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>{t('reservationSuccess.important')}</strong>{' '}
                  {t('reservationSuccess.importantText')}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => router.push('/profile')}
            className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition shadow-md hover:shadow-lg cursor-pointer"
          >
            {t('reservationSuccess.goToProfile')}
          </button>

          <button
            onClick={() => router.push('/')}
            className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition cursor-pointer"
          >
            {t('reservationSuccess.backHome')}
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            {t('reservationSuccess.needHelp')}{' '}
            <a
              href="mailto:smartrentalpro@abv.bg"
              className="text-indigo-600 hover:underline"
            >
              smartrentalpro@abv.bg
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ReservationSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <ReservationSuccessLoading />
        </div>
      }
    >
      <ReservationSuccessContent />
    </Suspense>
  );
}

function ReservationSuccessLoading() {
  const { t } = useTranslation();

  return <div className="text-lg">{t('reservationSuccess.loading')}</div>;
}
