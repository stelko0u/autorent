function stripPort(ip: string): string {
  const value = ip.trim();

  if (!value) {
    return '';
  }

  if (value.startsWith('[') && value.includes(']')) {
    return value.slice(1, value.indexOf(']'));
  }

  const colonCount = (value.match(/:/g) ?? []).length;

  if (colonCount === 1 && value.includes('.')) {
    return value.split(':')[0] ?? value;
  }

  return value;
}

function normalizeIp(ip: string | null | undefined): string | null {
  if (!ip) {
    return null;
  }

  const cleaned = stripPort(ip).trim();

  if (!cleaned) {
    return null;
  }

  if (cleaned === '::1') {
    return '127.0.0.1';
  }

  if (cleaned.startsWith('::ffff:')) {
    return cleaned.replace('::ffff:', '');
  }

  return cleaned;
}

export function isLocalIp(ip: string | null | undefined): boolean {
  if (!ip) {
    return true;
  }

  if (ip === '127.0.0.1' || ip === '::1') {
    return true;
  }

  if (ip.startsWith('10.') || ip.startsWith('192.168.')) {
    return true;
  }

  const match = ip.match(/^172\.(\d{1,3})\./);
  if (match) {
    const secondOctet = Number(match[1]);
    if (secondOctet >= 16 && secondOctet <= 31) {
      return true;
    }
  }

  return false;
}

export function getClientIp(req: Request): string | null {
  const xForwardedFor = req.headers.get('x-forwarded-for');
  if (xForwardedFor) {
    const first = xForwardedFor.split(',')[0];
    const normalized = normalizeIp(first);
    if (normalized) {
      return normalized;
    }
  }

  const realIpHeaders = [
    'x-real-ip',
    'cf-connecting-ip',
    'x-client-ip',
    'x-forwarded',
    'forwarded-for',
    'forwarded',
  ];

  for (const header of realIpHeaders) {
    const value = req.headers.get(header);
    const normalized = normalizeIp(value);
    if (normalized) {
      return normalized;
    }
  }

  return null;
}
