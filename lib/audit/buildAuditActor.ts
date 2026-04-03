import type { AuditActor } from '@/types/audit';
import type { User } from '@/types/database';

export function buildAuditActor(user: User | null | undefined): AuditActor {
  if (!user) {
    return {
      userId: null,
      role: null,
      email: null,
      displayName: null,
      companyId: null,
    };
  }

  return {
    userId: user.id ?? null,
    role: user.role ?? null,
    email: user.email ?? null,
    displayName: user.name ?? null,
    companyId: user.companyId ?? null,
  };
}
