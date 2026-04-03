import type { AuditLogRecord } from '@/types/audit';

function escapeCsvValue(value: string): string {
  if (value.includes('"') || value.includes(',') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

function serializeMetadata(metadata: Record<string, unknown>): string {
  try {
    return JSON.stringify(metadata);
  } catch {
    return '{}';
  }
}

export function buildAuditCsv(logs: AuditLogRecord[]): string {
  const headers = [
    'id',
    'createdAt',
    'entityType',
    'operation',
    'status',
    'action',
    'targetEntityId',
    'actorUserId',
    'actorRole',
    'actorEmail',
    'actorDisplayName',
    'companyId',
    'ipAddress',
    'country',
    'region',
    'city',
    'latitude',
    'longitude',
    'locationProvider',
    'errorMessage',
    'metadata',
  ];

  const rows = logs.map((log) => {
    const values = [
      String(log.id),
      log.createdAt,
      log.entityType,
      log.operation,
      log.status,
      log.action,
      String(log.targetEntityId ?? ''),
      String(log.actorUserId ?? ''),
      log.actorRole ?? '',
      log.actorEmail ?? '',
      log.actorDisplayName ?? '',
      String(log.companyId ?? ''),
      log.ipAddress ?? '',
      log.country ?? '',
      log.region ?? '',
      log.city ?? '',
      String(log.latitude ?? ''),
      String(log.longitude ?? ''),
      log.locationProvider ?? '',
      log.errorMessage ?? '',
      serializeMetadata(log.metadata),
    ];

    return values.map(escapeCsvValue).join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}

export function downloadAuditCsv(csv: string, fileName: string): void {
  const blob = new Blob([csv], {
    type: 'text/csv;charset=utf-8;',
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
}
