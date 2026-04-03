import type {
  AuditEntityType,
  AuditLogRecord,
  AuditOperation,
  AuditStatus,
} from '@/types/audit';

export function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('bg-BG', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function getOperationLabel(value: AuditOperation): string {
  switch (value) {
    case 'CREATE':
      return 'Добавяне';
    case 'UPDATE':
      return 'Редакция';
    case 'DELETE':
      return 'Изтриване';
    case 'BAN':
      return 'Бан';
    case 'UNBAN':
      return 'Ънбан';
    case 'PROFILE_UPDATE':
      return 'Промяна на профил';
    default:
      return value;
  }
}

export function getEntityLabel(value: AuditEntityType): string {
  switch (value) {
    case 'USER':
      return 'Потребител';
    case 'CAR':
      return 'Кола';
    case 'COMPANY':
      return 'Компания';
    case 'OFFICE':
      return 'Офис';
    default:
      return value;
  }
}

export function getStatusLabel(value: AuditStatus): string {
  switch (value) {
    case 'SUCCESS':
      return 'Успешно';
    case 'FAILURE':
      return 'Неуспешно';
    default:
      return value;
  }
}

export function getStatusClasses(value: AuditStatus): string {
  if (value === 'SUCCESS') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }

  return 'border-red-200 bg-red-50 text-red-700';
}

export function getOperationClasses(value: AuditOperation): string {
  switch (value) {
    case 'CREATE':
      return 'border-sky-200 bg-sky-50 text-sky-700';
    case 'UPDATE':
    case 'PROFILE_UPDATE':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'DELETE':
      return 'border-red-200 bg-red-50 text-red-700';
    case 'BAN':
      return 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700';
    case 'UNBAN':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700';
  }
}

export function getActorLabel(log: AuditLogRecord): string {
  if (log.actorDisplayName && log.actorEmail) {
    return `${log.actorDisplayName} (${log.actorEmail})`;
  }

  if (log.actorDisplayName) {
    return log.actorDisplayName;
  }

  if (log.actorEmail) {
    return log.actorEmail;
  }

  if (log.actorUserId) {
    return `User #${log.actorUserId}`;
  }

  return 'Система / неизвестен';
}

export function getLocationLabel(log: AuditLogRecord): string {
  const parts = [log.city, log.region, log.country].filter(
    (value): value is string => Boolean(value),
  );

  if (parts.length === 0) {
    return 'Няма данни';
  }

  return parts.join(', ');
}

export function buildModalTitle(log: AuditLogRecord): string {
  return `${getOperationLabel(log.operation)} • ${getEntityLabel(
    log.entityType,
  )} #${log.targetEntityId ?? '-'}`;
}
