import { query, queryOne } from '@/lib/db';
import type {
  AuditEntityType,
  AuditLogListFilters,
  AuditLogListResult,
  AuditLogRecord,
  AuditOperation,
  AuditStatus,
  CreateAuditLogInput,
} from '@/types/audit';

interface CountRow {
  count: string;
}

function clampPage(value: number): number {
  if (!Number.isFinite(value) || value < 1) {
    return 1;
  }

  return Math.floor(value);
}

function clampPageSize(value: number): number {
  if (!Number.isFinite(value) || value < 1) {
    return 25;
  }

  return Math.min(Math.floor(value), 200);
}

function normalizeSearch(value: string): string {
  return value.trim();
}

function buildWhereClause(
  filters: AuditLogListFilters,
  scope: 'admin' | 'company',
  companyId?: number,
) {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let index = 1;

  if (scope === 'company') {
    conditions.push(`"companyId" = $${index}`);
    values.push(companyId ?? null);
    index += 1;
  }

  if (filters.entityType !== 'ALL') {
    conditions.push(`"entityType" = $${index}`);
    values.push(filters.entityType);
    index += 1;
  }

  if (filters.operation !== 'ALL') {
    conditions.push(`"operation" = $${index}`);
    values.push(filters.operation);
    index += 1;
  }

  if (filters.status !== 'ALL') {
    conditions.push(`"status" = $${index}`);
    values.push(filters.status);
    index += 1;
  }

  if (filters.dateFrom) {
    conditions.push(`"createdAt" >= $${index}::timestamptz`);
    values.push(`${filters.dateFrom}T00:00:00.000Z`);
    index += 1;
  }

  if (filters.dateTo) {
    conditions.push(`"createdAt" <= $${index}::timestamptz`);
    values.push(`${filters.dateTo}T23:59:59.999Z`);
    index += 1;
  }

  const search = normalizeSearch(filters.search);

  if (search) {
    conditions.push(`
      (
        "action" ILIKE $${index}
        OR COALESCE("actorEmail", '') ILIKE $${index}
        OR COALESCE("actorDisplayName", '') ILIKE $${index}
        OR COALESCE("actorRole", '') ILIKE $${index}
        OR COALESCE("ipAddress", '') ILIKE $${index}
        OR COALESCE("country", '') ILIKE $${index}
        OR COALESCE("region", '') ILIKE $${index}
        OR COALESCE("city", '') ILIKE $${index}
        OR COALESCE("errorMessage", '') ILIKE $${index}
        OR COALESCE("metadata"::text, '') ILIKE $${index}
        OR COALESCE("entityType", '') ILIKE $${index}
        OR COALESCE("operation", '') ILIKE $${index}
        OR COALESCE("status", '') ILIKE $${index}
      )
    `);
    values.push(`%${search}%`);
    index += 1;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  return {
    whereClause,
    values,
    nextIndex: index,
  };
}

export class AuditRepository {
  static async create(input: CreateAuditLogInput): Promise<AuditLogRecord> {
    const metadata = input.metadata ?? {};
    const location = input.location ?? null;

    const result = await queryOne<AuditLogRecord>(
      `
        INSERT INTO "AuditLog" (
          "entityType",
          "operation",
          "status",
          "action",
          "targetEntityId",
          "actorUserId",
          "actorRole",
          "actorEmail",
          "actorDisplayName",
          "companyId",
          "ipAddress",
          "country",
          "region",
          "city",
          "latitude",
          "longitude",
          "locationProvider",
          "metadata",
          "errorMessage"
        )
        VALUES (
          $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15,
          $16, $17, $18::jsonb, $19
        )
        RETURNING *
      `,
      [
        input.entityType,
        input.operation,
        input.status,
        input.action,
        input.targetEntityId ?? null,
        input.actor.userId,
        input.actor.role,
        input.actor.email,
        input.actor.displayName,
        input.companyId ?? input.actor.companyId ?? null,
        input.ipAddress ?? null,
        location?.country ?? null,
        location?.region ?? null,
        location?.city ?? null,
        location?.latitude ?? null,
        location?.longitude ?? null,
        location?.provider ?? null,
        JSON.stringify(metadata),
        input.errorMessage ?? null,
      ],
    );

    if (!result) {
      throw new Error('AUDIT_LOG_CREATE_FAILED');
    }

    return result;
  }

  static async findManyForAdmin(limit = 100): Promise<AuditLogRecord[]> {
    return query<AuditLogRecord>(
      `
        SELECT *
        FROM "AuditLog"
        ORDER BY "createdAt" DESC
        LIMIT $1
      `,
      [limit],
    );
  }

  static async findManyForCompany(
    companyId: number,
    limit = 100,
  ): Promise<AuditLogRecord[]> {
    return query<AuditLogRecord>(
      `
        SELECT *
        FROM "AuditLog"
        WHERE "companyId" = $1
        ORDER BY "createdAt" DESC
        LIMIT $2
      `,
      [companyId, limit],
    );
  }

  static async findPagedForAdmin(
    rawFilters: AuditLogListFilters,
  ): Promise<AuditLogListResult> {
    const filters: AuditLogListFilters = {
      ...rawFilters,
      page: clampPage(rawFilters.page),
      pageSize: clampPageSize(rawFilters.pageSize),
      search: normalizeSearch(rawFilters.search),
    };

    const { whereClause, values, nextIndex } = buildWhereClause(
      filters,
      'admin',
    );

    const offset = (filters.page - 1) * filters.pageSize;

    const totalRow = await queryOne<CountRow>(
      `
        SELECT COUNT(*)::text AS count
        FROM "AuditLog"
        ${whereClause}
      `,
      values,
    );

    const logs = await query<AuditLogRecord>(
      `
        SELECT *
        FROM "AuditLog"
        ${whereClause}
        ORDER BY "createdAt" DESC, id DESC
        LIMIT $${nextIndex}
        OFFSET $${nextIndex + 1}
      `,
      [...values, filters.pageSize, offset],
    );

    const total = Number(totalRow?.count ?? '0');
    const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));

    return {
      logs,
      total,
      page: filters.page,
      pageSize: filters.pageSize,
      totalPages,
    };
  }

  static async findPagedForCompany(
    companyId: number,
    rawFilters: AuditLogListFilters,
  ): Promise<AuditLogListResult> {
    const filters: AuditLogListFilters = {
      ...rawFilters,
      page: clampPage(rawFilters.page),
      pageSize: clampPageSize(rawFilters.pageSize),
      search: normalizeSearch(rawFilters.search),
    };

    const { whereClause, values, nextIndex } = buildWhereClause(
      filters,
      'company',
      companyId,
    );

    const offset = (filters.page - 1) * filters.pageSize;

    const totalRow = await queryOne<CountRow>(
      `
        SELECT COUNT(*)::text AS count
        FROM "AuditLog"
        ${whereClause}
      `,
      values,
    );

    const logs = await query<AuditLogRecord>(
      `
        SELECT *
        FROM "AuditLog"
        ${whereClause}
        ORDER BY "createdAt" DESC, id DESC
        LIMIT $${nextIndex}
        OFFSET $${nextIndex + 1}
      `,
      [...values, filters.pageSize, offset],
    );

    const total = Number(totalRow?.count ?? '0');
    const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));

    return {
      logs,
      total,
      page: filters.page,
      pageSize: filters.pageSize,
      totalPages,
    };
  }

  static parseFiltersFromSearchParams(
    searchParams: URLSearchParams,
  ): AuditLogListFilters {
    const entityTypeRaw = searchParams.get('entityType');
    const operationRaw = searchParams.get('operation');
    const statusRaw = searchParams.get('status');

    const entityType: AuditEntityType | 'ALL' =
      entityTypeRaw === 'USER' ||
      entityTypeRaw === 'CAR' ||
      entityTypeRaw === 'COMPANY' ||
      entityTypeRaw === 'OFFICE'
        ? entityTypeRaw
        : 'ALL';

    const operation: AuditOperation | 'ALL' =
      operationRaw === 'CREATE' ||
      operationRaw === 'UPDATE' ||
      operationRaw === 'DELETE' ||
      operationRaw === 'BAN' ||
      operationRaw === 'UNBAN' ||
      operationRaw === 'PROFILE_UPDATE'
        ? operationRaw
        : 'ALL';

    const status: AuditStatus | 'ALL' =
      statusRaw === 'SUCCESS' || statusRaw === 'FAILURE' ? statusRaw : 'ALL';

    return {
      page: Number(searchParams.get('page') ?? '1'),
      pageSize: Number(searchParams.get('pageSize') ?? '25'),
      search: searchParams.get('search') ?? '',
      entityType,
      operation,
      status,
      dateFrom: searchParams.get('dateFrom') ?? '',
      dateTo: searchParams.get('dateTo') ?? '',
    };
  }
}
