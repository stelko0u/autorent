import type {
  AuditLogApiResponse,
  AuditLogListFilters,
  AuditLogListResult,
} from '@/types/audit';

function buildAuditQuery(filters: Partial<AuditLogListFilters>): string {
  const params = new URLSearchParams();

  if (filters.page !== undefined) {
    params.set('page', String(filters.page));
  }

  if (filters.pageSize !== undefined) {
    params.set('pageSize', String(filters.pageSize));
  }

  if (filters.search) {
    params.set('search', filters.search);
  }

  if (filters.entityType && filters.entityType !== 'ALL') {
    params.set('entityType', filters.entityType);
  }

  if (filters.operation && filters.operation !== 'ALL') {
    params.set('operation', filters.operation);
  }

  if (filters.status && filters.status !== 'ALL') {
    params.set('status', filters.status);
  }

  if (filters.dateFrom) {
    params.set('dateFrom', filters.dateFrom);
  }

  if (filters.dateTo) {
    params.set('dateTo', filters.dateTo);
  }

  return params.toString();
}

async function readAuditLogs(
  baseUrl: string,
  filters: Partial<AuditLogListFilters>,
): Promise<AuditLogListResult> {
  const query = buildAuditQuery(filters);
  const response = await fetch(query ? `${baseUrl}?${query}` : baseUrl, {
    method: 'GET',
    credentials: 'include',
    cache: 'no-store',
  });

  const payload = (await response.json()) as AuditLogApiResponse;

  if (!response.ok) {
    const message = payload.ok ? 'AUDIT_FETCH_FAILED' : payload.error;
    throw new Error(message);
  }

  if (!payload.ok) {
    throw new Error(payload.error);
  }

  return {
    logs: payload.logs,
    total: payload.total,
    page: payload.page,
    pageSize: payload.pageSize,
    totalPages: payload.totalPages,
  };
}

export async function getAdminAuditLogs(
  filters: Partial<AuditLogListFilters>,
): Promise<AuditLogListResult> {
  return readAuditLogs('/api/admin/audit', filters);
}

export async function getCompanyAuditLogs(
  filters: Partial<AuditLogListFilters>,
): Promise<AuditLogListResult> {
  return readAuditLogs('/api/company/audit', filters);
}
