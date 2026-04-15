'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSimpleReservation } from '@/lib/api/reservationApi';
import { useTranslation } from '@/providers/LanguageProvider';

const ReservationForm = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const [vehicleId, setVehicleId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!vehicleId || !startDate || !endDate) {
      setError(t('reservationPage.requiredFields'));
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError(t('reservationModal.startBeforeEnd'));
      return;
    }

    try {
      setLoading(true);

      const reservation = await createSimpleReservation({
        vehicleId: Number(vehicleId),
        startDate,
        endDate,
      });

      // ако API-то връща id
      router.push(`/reservation/${reservation.id}`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : t('reservationPage.failedCreate');

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}

      <div>
        <label htmlFor="vehicleId" className="block">
          {t('reservationForm.vehicleId')}
        </label>
        <input
          type="number"
          id="vehicleId"
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          className="w-full rounded border p-2"
          required
        />
      </div>

      <div>
        <label htmlFor="startDate" className="block">
          {t('paymentPage.startDate')}
        </label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          min={today}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full rounded border p-2"
          required
        />
      </div>

      <div>
        <label htmlFor="endDate" className="block">
          {t('paymentPage.endDate')}
        </label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          min={startDate || today}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-full rounded border p-2"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="rounded bg-blue-500 p-2 text-white disabled:opacity-60"
      >
        {loading ? t('adminAddCompany.creating') : t('carDetails.reserveNow')}
      </button>
    </form>
  );
};

export default ReservationForm;
