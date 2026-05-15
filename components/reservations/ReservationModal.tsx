'use client';

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { createReservation } from '@/lib/api/reservationApi';
import { Xmark } from '../icons';
import LoadingCircle from '../icons/LoadingCircle';
import { useTranslation } from '@/providers/LanguageProvider';

interface ReservationModalProps {
  carId: number;
  carName: string;
  pricePerDay: number;
  onClose: () => void;
  onSuccess: () => void;
}

interface ReservationFormData {
  startDate: string;
  endDate: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  notes: string;
  paymentMethod: 'CARD' | 'ON_SPOT';
}

export default function ReservationModal({
  carId,
  carName,
  pricePerDay,
  onClose,
  onSuccess,
}: ReservationModalProps) {
  const { t, locale } = useTranslation();
  const [formData, setFormData] = useState<ReservationFormData>({
    startDate: '',
    endDate: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    notes: '',
    paymentMethod: 'ON_SPOT',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = <K extends keyof ReservationFormData>(
    key: K,
    value: ReservationFormData[K],
  ) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.startDate) newErrors.startDate = t('reservationModal.startDateRequired');
    if (!formData.endDate) newErrors.endDate = t('reservationModal.endDateRequired');
    if (!formData.firstName) newErrors.firstName = t('reservationModal.firstNameRequired');
    if (!formData.lastName) newErrors.lastName = t('reservationModal.lastNameRequired');
    if (!formData.email) newErrors.email = t('reservationModal.emailRequired');
    if (!formData.phone) newErrors.phone = t('reservationModal.phoneRequired');

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (start < today) {
        newErrors.startDate = t('reservationModal.startDatePast');
      }

      if (end <= start) {
        newErrors.endDate = t('reservationModal.endDateAfterStart');
      }
    }

    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = t('validation.invalidEmail');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const result = await createReservation({
        carId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        paymentMethod: formData.paymentMethod,
        locale,
      });

      toast.success(
        result.flow?.nextStep === 'payment'
          ? t('reservationModal.createdContinuePayment')
          : t('reservationModal.confirmedSuccessfully'),
      );

      onSuccess();
      onClose();

      setFormData({
        startDate: '',
        endDate: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        notes: '',
        paymentMethod: 'ON_SPOT',
      });
    } catch (error: unknown) {
      console.error('Reservation error:', error);
      toast.error(
        error instanceof Error ? error.message : t('reservationPage.failedCreate'),
      );
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalPrice = () => {
    if (!formData.startDate || !formData.endDate) return 0;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const days = Math.ceil(
      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
    );

    return days * pricePerDay;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="p-6">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t('reservationModal.reserve')} {carName}
              </h2>
              <p className="mt-1 text-gray-600">
                {pricePerDay} EUR {t('vehicle.pricePerDay').toLowerCase()}
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-gray-400 transition hover:text-gray-600"
              type="button"
            >
              <Xmark className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => updateFormData('startDate', e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.startDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.startDate ? (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.startDate}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  End Date *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => updateFormData('endDate', e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.endDate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min={
                    formData.startDate || new Date().toISOString().split('T')[0]
                  }
                />
                {errors.endDate ? (
                  <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  First Name *
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => updateFormData('firstName', e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.firstName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.firstName ? (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.firstName}
                  </p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => updateFormData('lastName', e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.lastName ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.lastName ? (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email ? (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                ) : null}
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Phone *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  className={`w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.phone ? (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                ) : null}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Payment Method *
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) =>
                  updateFormData(
                    'paymentMethod',
                    e.target.value as 'CARD' | 'ON_SPOT',
                  )
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="ON_SPOT">{t('reservationPage.onSite')}</option>
                <option value="CARD">{t('reservationPage.onlineCard')}</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => updateFormData('notes', e.target.value)}
                rows={3}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder={t('reservationModal.notesPlaceholder')}
              />
            </div>

            {calculateTotalPrice() > 0 ? (
              <div className="rounded-lg bg-gray-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold">{t('reservationModal.totalPrice')}:</span>
                  <span className="text-2xl font-bold text-indigo-600">
                    {calculateTotalPrice()} EUR
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {(() => {
                    const start = new Date(formData.startDate);
                    const end = new Date(formData.endDate);
                    const days = Math.ceil(
                      (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
                    );

                    return `${days} ${days === 1 ? t('reservationPage.day') : t('reservationPage.days')} × ${pricePerDay} EUR/${t('reservationPage.day')}`;
                  })()}
                </div>
              </div>
            ) : null}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                {t('common.cancel')}
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 rounded-md border border-transparent bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center">
                    <LoadingCircle className="mr-2 h-5 w-5 animate-spin" />
                    {t('reservationPage.processing')}
                  </div>
                ) : (
                  t('carDetails.reserveNow')
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
