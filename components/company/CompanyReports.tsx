'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BadgeDollar, ChartLine, Check, Clipboard } from '../icons';
import {
  CompanyPanelCard,
  CompanyPanelEmptyState,
  CompanyPanelInfoCard,
  CompanyPanelPageHeader,
  CompanyPanelPagination,
  CompanyPanelSearch,
  CompanyPanelStatCard,
  CompanyPanelToolbar,
} from './CompanyPanelUI';
import { getCompanyReport, getCompanyReportPdfUrl } from '@/lib/api/companyApi';

type ReportItem = {
  reservationId: number | null;
  customerName: string;
  customerEmail: string;
  carLabel: string;
  amount: number;
  platformFee: number;
  companyEarnings: number;
  paidAt: string;
};

type ReportSummary = {
  totalRevenue: number;
  platformFee: number;
  companyEarnings: number;
  paymentsCount: number;
};

const PAGE_SIZE = 8;

function money(value?: number) {
  return new Intl.NumberFormat('bg-BG', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number(value || 0));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('bg-BG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

function defaultStart() {
  const date = new Date();
  date.setDate(1);
  return date.toISOString().slice(0, 10);
}

function defaultEnd() {
  return new Date().toISOString().slice(0, 10);
}

export default function CompanyReports() {
  const [startDate, setStartDate] = useState(defaultStart());
  const [endDate, setEndDate] = useState(defaultEnd());
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [items, setItems] = useState<ReportItem[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getCompanyReport({
        startDate,
        endDate,
      });

      setSummary(data.summary);
      setItems(data.items);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load report');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    void loadReport();
  }, [loadReport]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, startDate, endDate]);

  function downloadPdf() {
    const url = getCompanyReportPdfUrl({
      startDate,
      endDate,
    });

    window.open(url, '_blank', 'noopener,noreferrer');
  }

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return items;
    }

    return items.filter((item) =>
      [
        item.reservationId?.toString(),
        item.customerName,
        item.customerEmail,
        item.carLabel,
        item.paidAt,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE));

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredItems.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredItems, currentPage]);

  return (
    <div className="space-y-6">
      <CompanyPanelPageHeader
        eyebrow="Reports"
        title="Financial reports"
        description="Date-based reporting, export actions and the same premium panel look used everywhere else."
        rightSlot={
          <div className="grid gap-3 sm:grid-cols-2">
            <CompanyPanelInfoCard
              label="Period start"
              value={startDate}
              description="Current report range start date."
            />
            <CompanyPanelInfoCard
              label="Period end"
              value={endDate}
              description="Current report range end date."
              tone="success"
            />
          </div>
        }
      />

      <CompanyPanelCard
        title="Report filters"
        description="Choose a period and export the same results to PDF."
      >
        <div className="grid gap-4 px-6 py-5 md:grid-cols-4 md:items-end sm:px-8">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Start date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="h-11 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              End date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="h-11 w-full rounded-2xl border border-gray-200 bg-white px-4 text-sm text-gray-700 outline-none transition focus:border-indigo-300 focus:ring-4 focus:ring-indigo-100"
            />
          </div>

          <button
            type="button"
            onClick={() => void loadReport()}
            disabled={loading}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-indigo-600 px-4 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {loading ? 'Loading…' : 'Load report'}
          </button>

          <button
            type="button"
            onClick={downloadPdf}
            className="inline-flex h-11 items-center justify-center rounded-2xl bg-emerald-600 px-4 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            Export PDF
          </button>
        </div>

        {error ? (
          <div className="px-6 pb-5 sm:px-8">
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
              {error}
            </div>
          </div>
        ) : null}
      </CompanyPanelCard>

      {summary ? (
        <section className="grid gap-4 xl:grid-cols-4">
          <CompanyPanelStatCard
            title="Payments count"
            value={String(summary.paymentsCount)}
            subtitle="Included transactions in range"
            icon={<ChartLine className="h-7 w-7" />}
            variant="accent"
          />
          <CompanyPanelStatCard
            title="Gross revenue"
            value={money(summary.totalRevenue)}
            subtitle="All payments in selected range"
            icon={<BadgeDollar className="h-7 w-7" />}
          />
          <CompanyPanelStatCard
            title="Platform fee"
            value={money(summary.platformFee)}
            subtitle="Fee calculation for the range"
            icon={<Clipboard className="h-7 w-7" />}
          />
          <CompanyPanelStatCard
            title="Net earnings"
            value={money(summary.companyEarnings)}
            subtitle="Company result for this report"
            icon={<Check className="h-7 w-7" />}
            variant="success"
          />
        </section>
      ) : null}

      <CompanyPanelCard
        title="Payments in range"
        description="Paginated report rows using the same shared panel components."
      >
        <CompanyPanelToolbar
          rightSlot={
            <CompanyPanelSearch
              value={search}
              onChange={setSearch}
              placeholder="Search by reservation, customer or car"
            />
          }
        />

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 sm:px-8">
                  Reservation
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                  Car
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                  Gross
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                  Fee / Net
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 sm:px-8">
                  Paid at
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <CompanyPanelEmptyState
                      title="No payments in selected range"
                      description="Try a different date range or search query."
                    />
                  </td>
                </tr>
              ) : (
                currentItems.map((item, index) => (
                  <tr
                    key={`${item.reservationId || 'report'}-${index}`}
                    className="transition-colors hover:bg-gray-50/80"
                  >
                    <td className="px-6 py-5 text-sm text-gray-600 sm:px-8">
                      {item.reservationId ? `#${item.reservationId}` : '—'}
                    </td>

                    <td className="px-6 py-5">
                      <div className="text-sm font-medium text-gray-900">
                        {item.customerName || '—'}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        {item.customerEmail || 'No email'}
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-600">
                      {item.carLabel || '—'}
                    </td>

                    <td className="px-6 py-5 text-sm font-semibold text-gray-900">
                      {money(item.amount)}
                    </td>

                    <td className="px-6 py-5 text-sm">
                      <div className="font-medium text-red-600">
                        Fee {money(item.platformFee)}
                      </div>
                      <div className="mt-1 font-semibold text-emerald-600">
                        Net {money(item.companyEarnings)}
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-600 sm:px-8">
                      {formatDate(item.paidAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <CompanyPanelPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredItems.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </CompanyPanelCard>
    </div>
  );
}
