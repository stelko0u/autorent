'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { BadgeDollar, Check, Clipboard, Clock } from '../icons';
import {
  CompanyPanelBadge,
  CompanyPanelCard,
  CompanyPanelEmptyState,
  CompanyPanelInfoCard,
  CompanyPanelMetricCard,
  CompanyPanelPageHeader,
  CompanyPanelPagination,
  CompanyPanelSearch,
  CompanyPanelStatCard,
  CompanyPanelToolbar,
} from './CompanyPanelUI';
import { getCompanyInvoices } from '@/lib/api/companyApi';

type InvoiceRow = {
  id: string;
  number: string | null;
  status: string | null;
  currency: string;
  total: number;
  amount_due: number;
  amount_paid: number;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
  created: number;
  due_date: number | null;
  reservationId: number;
  customerEmail: string;
  customerName: string;
  grossAmount: number;
  platformFee: number;
  companyEarnings: number;
};

const PAGE_SIZE = 8;

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat('bg-BG', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(value ?? 0);
}

function formatDate(timestamp: number | null) {
  if (!timestamp) return '—';

  return new Intl.DateTimeFormat('bg-BG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(timestamp * 1000));
}

function getStatusTone(
  status: string | null,
): 'gray' | 'amber' | 'green' | 'red' | 'blue' {
  switch (status) {
    case 'paid':
      return 'green';
    case 'open':
      return 'amber';
    case 'uncollectible':
      return 'red';
    case 'draft':
      return 'blue';
    default:
      return 'gray';
  }
}

export default function CompanyInvoices() {
  const [invoices, setInvoices] = useState<InvoiceRow[]>([]);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadInvoices() {
    try {
      setLoading(true);
      setError(null);

      const nextInvoices = await getCompanyInvoices();
      setInvoices(nextInvoices);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadInvoices();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredInvoices = useMemo(() => {
    const query = search.trim().toLowerCase();

    const sorted = [...invoices].sort((a, b) => b.created - a.created);

    if (!query) {
      return sorted;
    }

    return sorted.filter((invoice) =>
      [
        invoice.id,
        invoice.number,
        invoice.status,
        invoice.customerName,
        invoice.customerEmail,
        invoice.reservationId.toString(),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query),
    );
  }, [invoices, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredInvoices.length / PAGE_SIZE),
  );

  const currentItems = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return filteredInvoices.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredInvoices, currentPage]);

  const summary = useMemo(() => {
    return filteredInvoices.reduce(
      (accumulator, invoice) => {
        accumulator.gross += invoice.grossAmount || invoice.total || 0;
        accumulator.fee += invoice.platformFee || 0;
        accumulator.net += invoice.companyEarnings || 0;

        if (invoice.status === 'paid') {
          accumulator.paid += 1;
        }

        return accumulator;
      },
      {
        gross: 0,
        fee: 0,
        net: 0,
        paid: 0,
      },
    );
  }, [filteredInvoices]);

  if (loading) {
    return (
      <div className="rounded-[28px] border border-gray-200 bg-white p-8 shadow-sm">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-44 rounded-xl bg-gray-200" />
          <div className="h-4 w-72 rounded-xl bg-gray-100" />
          <div className="grid gap-4 pt-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-28 rounded-3xl border border-gray-100 bg-gray-50"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CompanyPanelPageHeader
        eyebrow="Invoices"
        title="Invoice center"
        description="All invoice records follow the same structure as the dashboard and payments pages."
        rightSlot={
          <div className="grid gap-3 sm:grid-cols-2">
            <CompanyPanelInfoCard
              label="Total invoices"
              value={String(filteredInvoices.length)}
              description="Count after active search filter."
            />
            <CompanyPanelInfoCard
              label="Net amount"
              value={formatMoney(summary.net, 'EUR')}
              description="Current visible invoice earnings."
              tone="success"
            />
          </div>
        }
      />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-4">
        <CompanyPanelStatCard
          title="Gross total"
          value={formatMoney(summary.gross, 'EUR')}
          subtitle="Invoice gross amount"
          icon={<BadgeDollar className="h-7 w-7" />}
          variant="accent"
        />
        <CompanyPanelStatCard
          title="Platform fee"
          value={formatMoney(summary.fee, 'EUR')}
          subtitle="Total fee across listed invoices"
          icon={<Clipboard className="h-7 w-7" />}
        />
        <CompanyPanelStatCard
          title="Net to company"
          value={formatMoney(summary.net, 'EUR')}
          subtitle="Company earnings from invoices"
          icon={<Check className="h-7 w-7" />}
          variant="success"
        />
        <CompanyPanelStatCard
          title="Paid invoices"
          value={String(summary.paid)}
          subtitle="Successfully settled invoices"
          icon={<Clock className="h-7 w-7" />}
        />
      </section>

      <CompanyPanelCard
        title="Invoice list"
        description="Same spacing, same borders and same pagination rhythm as the rest of the panel."
        rightSlot={
          <button
            type="button"
            onClick={() => void loadInvoices()}
            className="inline-flex h-11 items-center rounded-2xl border border-gray-200 bg-white px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Refresh
          </button>
        }
      >
        <CompanyPanelToolbar
          rightSlot={
            <CompanyPanelSearch
              value={search}
              onChange={setSearch}
              placeholder="Search by invoice number, customer or reservation"
            />
          }
        />

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 sm:px-8">
                  Invoice
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                  Reservation
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                  Gross
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">
                  Fee / Net
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 sm:px-8">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200 bg-white">
              {currentItems.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <CompanyPanelEmptyState
                      title="No invoices found"
                      description="No invoice matches the current criteria."
                    />
                  </td>
                </tr>
              ) : (
                currentItems.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="transition-colors hover:bg-gray-50/80"
                  >
                    <td className="px-6 py-5 sm:px-8">
                      <div className="font-semibold text-gray-900">
                        {invoice.number || invoice.id}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        Created {formatDate(invoice.created)}
                      </div>
                      <div className="mt-1 text-xs text-gray-400">
                        Due {formatDate(invoice.due_date)}
                      </div>
                    </td>

                    <td className="px-6 py-5 text-sm text-gray-600">
                      #{invoice.reservationId}
                    </td>

                    <td className="px-6 py-5">
                      <div className="text-sm font-medium text-gray-900">
                        {invoice.customerName || '—'}
                      </div>
                      <div className="mt-1 text-sm text-gray-500">
                        {invoice.customerEmail || 'No email'}
                      </div>
                    </td>

                    <td className="px-6 py-5">
                      <CompanyPanelBadge tone={getStatusTone(invoice.status)}>
                        {invoice.status || 'unknown'}
                      </CompanyPanelBadge>
                    </td>

                    <td className="px-6 py-5 text-sm font-semibold text-gray-900">
                      {formatMoney(
                        invoice.grossAmount || invoice.total,
                        invoice.currency,
                      )}
                    </td>

                    <td className="px-6 py-5 text-sm">
                      <div className="font-medium text-red-600">
                        Fee{' '}
                        {formatMoney(
                          invoice.platformFee || 0,
                          invoice.currency,
                        )}
                      </div>
                      <div className="mt-1 font-semibold text-emerald-600">
                        Net{' '}
                        {formatMoney(
                          invoice.companyEarnings || 0,
                          invoice.currency,
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-5 sm:px-8">
                      <div className="flex flex-wrap gap-2">
                        {invoice.hosted_invoice_url ? (
                          <a
                            href={invoice.hosted_invoice_url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-10 items-center rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                          >
                            Open
                          </a>
                        ) : null}

                        {invoice.invoice_pdf ? (
                          <a
                            href={invoice.invoice_pdf}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-10 items-center rounded-xl bg-indigo-600 px-3 text-sm font-medium text-white transition hover:bg-indigo-700"
                          >
                            PDF
                          </a>
                        ) : null}
                      </div>
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
          totalItems={filteredInvoices.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </CompanyPanelCard>
    </div>
  );
}
