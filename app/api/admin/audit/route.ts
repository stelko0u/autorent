import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { AuditRepository } from '@/lib/repository/AuditRepository';

export async function GET(req: Request) {
  const check = await requireAdmin(req);
  if (!check.ok) return check.resp;

  try {
    const { searchParams } = new URL(req.url);
    const filters = AuditRepository.parseFiltersFromSearchParams(searchParams);
    const result = await AuditRepository.findPagedForAdmin(filters);

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    console.error('GET /api/admin/audit error:', error);

    return NextResponse.json(
      {
        ok: false,
        error: 'audit_fetch_failed',
      },
      { status: 500 },
    );
  }
}
