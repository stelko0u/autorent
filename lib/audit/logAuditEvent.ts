import type { CreateAuditLogInput } from '@/types/audit';
import { AuditRepository } from '../repository/AuditRepository';
import { getClientIp } from './getClientIp';
import { getIpGeolocation } from './getIpGeolocation';

type SafeAuditInput = Omit<CreateAuditLogInput, 'ipAddress' | 'location'> & {
  ipAddress?: string | null;
};

export async function logAuditEvent(
  req: Request | null,
  input: SafeAuditInput,
) {
  const ipAddress = input.ipAddress ?? (req ? getClientIp(req) : null);
  const location = await getIpGeolocation(ipAddress);

  return AuditRepository.create({
    ...input,
    ipAddress,
    location,
  });
}

export async function safeLogAuditEvent(
  req: Request | null,
  input: SafeAuditInput,
): Promise<void> {
  try {
    await logAuditEvent(req, input);
  } catch (error) {
    console.error('safeLogAuditEvent failed:', error);
  }
}
