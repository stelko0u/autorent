import type {
  AuditEntityType,
  AuditLogRecord,
  AuditOperation,
  AuditStatus,
} from '@/types/audit';

type Translator = (key: string, params?: Record<string, string | number>) => string;

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

export function getOperationLabel(value: AuditOperation, t?: Translator): string {
  switch (value) {
    case 'CREATE':
      return t ? t('audit.create') : 'Добавяне';
    case 'UPDATE':
      return t ? t('audit.update') : 'Редакция';
    case 'DELETE':
      return t ? t('audit.delete') : 'Изтриване';
    case 'BAN':
      return t ? t('audit.ban') : 'Бан';
    case 'UNBAN':
      return t ? t('audit.unban') : 'Ънбан';
    case 'PROFILE_UPDATE':
      return t ? t('audit.profileUpdate') : 'Промяна на профил';
    default:
      return value;
  }
}

export function getEntityLabel(value: AuditEntityType, t?: Translator): string {
  switch (value) {
    case 'USER':
      return t ? t('audit.user') : 'Потребител';
    case 'CAR':
      return t ? t('audit.cars') : 'Кола';
    case 'COMPANY':
      return t ? t('audit.company') : 'Компания';
    case 'OFFICE':
      return t ? t('audit.offices') : 'Офис';
    default:
      return value;
  }
}

export function getStatusLabel(value: AuditStatus, t?: Translator): string {
  switch (value) {
    case 'SUCCESS':
      return t ? t('audit.success') : 'Успешно';
    case 'FAILURE':
      return t ? t('audit.failure') : 'Неуспешно';
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

export function getActorLabel(log: AuditLogRecord, t?: Translator): string {
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

  return t ? t('audit.systemUnknown') : 'Система / неизвестен';
}

export function getLocationLabel(log: AuditLogRecord, t?: Translator): string {
  const parts = [log.city, log.region, log.country].filter(
    (value): value is string => Boolean(value),
  );

  if (parts.length === 0) {
    return t ? t('audit.noData') : 'Няма данни';
  }

  return parts.join(', ');
}

export function buildModalTitle(log: AuditLogRecord, t?: Translator): string {
  return `${getOperationLabel(log.operation, t)} • ${getEntityLabel(
    log.entityType,
    t,
  )} #${log.targetEntityId ?? '-'}`;
}
