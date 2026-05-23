'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  AdminReservationRow,
  fetchAdminReservations,
  fetchCompanies,
} from '@/lib/api/adminApi';
import { Company } from '@/types/types';
import { useTranslation } from '@/providers/LanguageProvider';

function getTodayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value: string, locale: 'bg' | 'en') {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-US' : 'bg-BG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value));
}

function formatMoney(value: string | number | null, locale: 'bg' | 'en') {
  return new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'bg-BG', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(value ?? 0));
}

function statusClass(status: string | null) {
  switch ((status || '').toUpperCase()) {
    case 'PAID':
    case 'CONFIRMED':
    case 'COMPLETED':
    case 'RETURNED':
      return 'bg-emerald-50 text-emerald-700 ring-emerald-200';
    case 'PENDING':
      return 'bg-amber-50 text-amber-700 ring-amber-200';
    case 'FAILED':
    case 'CANCELLED':
    case 'REFUNDED':
      return 'bg-red-50 text-red-700 ring-red-200';
    default:
      return 'bg-slate-50 text-slate-700 ring-slate-200';
  }
}

export default function AdminReservations() {
  const { t, locale } = useTranslation();
  const [reservations, setReservations] = useState<AdminReservationRow[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [companyId, setCompanyId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalRevenue = useMemo(
    () =>
      reservations.reduce(
        (sum, reservation) => sum + Number(reservation.total_price ?? 0),
        0,
      ),
    [reservations],
  );

  async function load(nextFilters?: {
    companyId?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const filters = nextFilters ?? { companyId, dateFrom, dateTo };

    setLoading(true);
    setError(null);

    try {
      const [reservationsData, companiesData] = await Promise.all([
        fetchAdminReservations({
          companyId: filters.companyId || undefined,
          dateFrom: filters.dateFrom || undefined,
          dateTo: filters.dateTo || undefined,
        }),
        companies.length ? Promise.resolve(companies) : fetchCompanies(),
      ]);

      setReservations(reservationsData);
      setCompanies(companiesData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t('adminReservations.loadError'),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function clearFilters() {
    const emptyFilters = { companyId: '', dateFrom: '', dateTo: '' };
    setCompanyId('');
    setDateFrom('');
    setDateTo('');
    load(emptyFilters);
  }

  return (
    <section className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              {t('adminReservations.title')}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {t('adminReservations.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t('adminReservations.company')}
              </span>
              <select
                value={companyId}
                onChange={(event) => setCompanyId(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 lg:w-48"
              >
                <option value="">{t('adminReservations.allCompanies')}</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t('adminReservations.from')}
              </span>
              <input
                type="date"
                value={dateFrom}
                max={dateTo || undefined}
                onChange={(event) => setDateFrom(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {t('adminReservations.to')}
              </span>
              <input
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                max={getTodayInputValue()}
                onChange={(event) => setDateTo(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <button
              type="button"
              onClick={() => load()}
              disabled={loading}
              className="h-11 self-end rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t('adminReservations.apply')}
            </button>

            <button
              type="button"
              onClick={clearFilters}
              disabled={loading}
              className="h-11 self-end rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t('adminReservations.clear')}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">
            {t('adminReservations.results')}
          </p>
          <p className="mt-1 text-2xl font-bold text-slate-900">
            {reservations.length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">
            {t('adminReservations.totalRevenue')}
          </p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            {formatMoney(totalRevenue, locale)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">
            {t('adminReservations.filteredBy')}
          </p>
          <p className="mt-1 truncate text-sm font-semibold text-slate-900">
            {companyId
              ? companies.find((company) => String(company.id) === companyId)
                  ?.name
              : t('adminReservations.allCompanies')}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {error ? (
          <div className="m-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-600" />
              <p className="text-sm font-medium text-slate-600">
                {t('common.loading')}
              </p>
            </div>
          </div>
        ) : reservations.length === 0 ? (
          <div className="flex min-h-64 items-center justify-center p-6 text-center">
            <div>
              <p className="text-base font-semibold text-slate-700">
                {t('adminReservations.empty')}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {t('adminReservations.emptyDescription')}
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-250 w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">{t('common.id')}</th>
                  <th className="px-5 py-4">{t('adminReservations.company')}</th>
                  <th className="px-5 py-4">{t('adminReservations.customer')}</th>
                  <th className="px-5 py-4">{t('adminReservations.car')}</th>
                  <th className="px-5 py-4">{t('adminReservations.period')}</th>
                  <th className="px-5 py-4">{t('adminReservations.total')}</th>
                  <th className="px-5 py-4">{t('adminReservations.status')}</th>
                  <th className="px-5 py-4">{t('adminReservations.payment')}</th>
                  <th className="px-5 py-4">{t('adminReservations.created')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {reservations.map((reservation) => {
                  const customerName =
                    `${reservation.first_name ?? ''} ${
                      reservation.last_name ?? ''
                    }`.trim() || '-';
                  const carLabel = `${reservation.car_make} ${
                    reservation.car_model
                  }${reservation.car_year ? ` ${reservation.car_year}` : ''}`;

                  return (
                    <tr key={reservation.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-slate-900">
                        #{reservation.id}
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900">
                          {reservation.company_name}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-900">
                          {customerName}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {reservation.email || reservation.phone || '-'}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-slate-700">{carLabel}</td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-700">
                        {formatDate(reservation.start_date, locale)} -{' '}
                        {formatDate(reservation.end_date, locale)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 font-semibold text-emerald-600">
                        {formatMoney(reservation.total_price, locale)}
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClass(
                            reservation.status,
                          )}`}
                        >
                          {reservation.status}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClass(
                            reservation.payment_status,
                          )}`}
                        >
                          {reservation.payment_status || '-'}
                        </span>
                        <p className="mt-1 text-xs text-slate-500">
                          {reservation.payment_method || '-'}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                        {formatDate(reservation.created_at, locale)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
