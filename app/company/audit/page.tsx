import React from 'react';
import { AuditLogsClient } from '@/components/audit/AuditLogsClient';
import { AuditRepository } from '@/lib/repository/AuditRepository';
import { requireCompanyUser } from '@/lib/auth/requireCompany';
import type { AuditLogListFilters } from '@/types/audit';

interface CompanyAuditPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

function getSingleQueryValue(
  value: string | string[] | undefined,
): string | null {
  if (typeof value === 'string') {
    return value;
  }

  if (Array.isArray(value) && value.length > 0) {
    return value[0] ?? null;
  }

  return null;
}

export default async function CompanyAuditPage({
  searchParams,
}: CompanyAuditPageProps) {
  const user = await requireCompanyUser();

  const resolved = searchParams ? await searchParams : {};
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(resolved)) {
    const singleValue = getSingleQueryValue(value);

    if (singleValue) {
      params.set(key, singleValue);
    }
  }

  const initialFilters: AuditLogListFilters =
    AuditRepository.parseFiltersFromSearchParams(params);

  const initialData = await AuditRepository.findPagedForCompany(
    user.companyId,
    initialFilters,
  );

  return (
    <main className="space-y-6 p-4 md:p-6">
      <AuditLogsClient
        mode="company"
        title="Company Audit Logs"
        description="Тук се пазят действията, извършени за твоята компания."
        initialData={initialData}
        initialFilters={initialFilters}
      />
    </main>
  );
}
