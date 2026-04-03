export type AuditEntityType = 'USER' | 'CAR' | 'COMPANY' | 'OFFICE';

export type AuditOperation =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'BAN'
  | 'UNBAN'
  | 'PROFILE_UPDATE';

export type AuditStatus = 'SUCCESS' | 'FAILURE';

export interface AuditActor {
  userId: number | null;
  role: 'USER' | 'ADMIN' | 'COMPANY' | null;
  email: string | null;
  displayName: string | null;
  companyId: number | null;
}

export interface AuditLocation {
  country: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  provider: string | null;
}

export interface CreateAuditLogInput {
  entityType: AuditEntityType;
  operation: AuditOperation;
  status: AuditStatus;
  action: string;
  targetEntityId?: number | null;
  actor: AuditActor;
  companyId?: number | null;
  ipAddress?: string | null;
  location?: AuditLocation | null;
  metadata?: Record<string, unknown>;
  errorMessage?: string | null;
}

export interface AuditLogRecord {
  id: number;
  createdAt: string;
  entityType: AuditEntityType;
  operation: AuditOperation;
  status: AuditStatus;
  action: string;
  targetEntityId: number | null;
  actorUserId: number | null;
  actorRole: string | null;
  actorEmail: string | null;
  actorDisplayName: string | null;
  companyId: number | null;
  ipAddress: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  locationProvider: string | null;
  metadata: Record<string, unknown>;
  errorMessage: string | null;
}

export interface AuditLogListFilters {
  page: number;
  pageSize: number;
  search: string;
  entityType: AuditEntityType | 'ALL';
  operation: AuditOperation | 'ALL';
  status: AuditStatus | 'ALL';
  dateFrom: string;
  dateTo: string;
}

export interface AuditLogListResult {
  logs: AuditLogRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface AuditLogListResponse extends AuditLogListResult {
  ok: true;
}

export interface AuditLogErrorResponse {
  ok: false;
  error: string;
}

export type AuditLogApiResponse = AuditLogListResponse | AuditLogErrorResponse;
