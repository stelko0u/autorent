'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Check } from '@/components/icons';

export default function ReservationSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <Check className="h-8 w-8 text-green-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Reservation Confirmed!
        </h1>
        <p className="text-gray-600 mb-8">
          Your car reservation has been successfully confirmed. You will receive
          a confirmation email shortly.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/')}
            className="w-full px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition"
          >
            Back to Home
          </button>
          <button
            onClick={() => router.push('/profile/reservations')}
            className="w-full px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
          >
            View My Reservations
          </button>
        </div>
      </div>
    </div>
  );
}
