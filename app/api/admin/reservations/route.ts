import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { getAdminReservations } from '@/lib/repository/admin/AdminRepository';

function parseDate(value: string | null) {
  if (!value) return null;

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function addOneUtcDay(value: Date) {
  const next = new Date(value);
  next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

export async function GET(req: Request) {
  const check = await requireAdmin(req);
  if (!check.ok) return check.resp;

  try {
    const url = new URL(req.url);
    const companyIdParam = url.searchParams.get('companyId');
    const companyId = companyIdParam ? Number(companyIdParam) : undefined;
    const dateFrom = parseDate(url.searchParams.get('dateFrom'));
    const dateTo = parseDate(url.searchParams.get('dateTo'));

    if (companyIdParam && (!companyId || Number.isNaN(companyId))) {
      return NextResponse.json(
        { ok: false, error: 'invalid_company_id' },
        { status: 400 },
      );
    }

    const reservations = await getAdminReservations({
      companyId,
      dateFrom: dateFrom ?? undefined,
      dateToExclusive: dateTo ? addOneUtcDay(dateTo) : undefined,
    });

    return NextResponse.json({ ok: true, reservations });
  } catch (err) {
    console.error('GET /api/admin/reservations error:', err);
    return NextResponse.json(
      { ok: false, error: 'db_error' },
      { status: 500 },
    );
  }
}
