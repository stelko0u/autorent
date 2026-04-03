import type { AuditLocation } from '@/types/audit';
import { isLocalIp } from './getClientIp';

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null;
}

function readString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function readNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function pickString(source: JsonRecord, keys: string[]): string | null {
  for (const key of keys) {
    const value = readString(source[key]);
    if (value) {
      return value;
    }
  }

  return null;
}

function pickNumber(source: JsonRecord, keys: string[]): number | null {
  for (const key of keys) {
    const value = readNumber(source[key]);
    if (value !== null) {
      return value;
    }
  }

  return null;
}

function buildUrl(ip: string): string | null {
  const template = process.env.IP_GEOLOCATION_URL_TEMPLATE?.trim();

  if (!template) {
    return null;
  }

  return template.replace('{ip}', encodeURIComponent(ip));
}

export async function getIpGeolocation(
  ip: string | null,
): Promise<AuditLocation | null> {
  if (!ip || isLocalIp(ip)) {
    return null;
  }

  const url = buildUrl(ip);
  if (!url) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!response.ok) {
      return null;
    }

    const payload: unknown = await response.json();

    if (!isRecord(payload)) {
      return null;
    }

    return {
      country: pickString(payload, ['country', 'country_name']),
      region: pickString(payload, [
        'region',
        'regionName',
        'state',
        'province',
      ]),
      city: pickString(payload, ['city']),
      latitude: pickNumber(payload, ['latitude', 'lat']),
      longitude: pickNumber(payload, ['longitude', 'lon', 'lng']),
      provider: new URL(url).hostname,
    };
  } catch (error) {
    console.warn('getIpGeolocation failed:', error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
