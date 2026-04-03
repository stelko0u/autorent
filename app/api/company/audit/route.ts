import { NextResponse } from 'next/server';
import { requireAuthUserFromRequest } from '@/lib/auth';
import { AuditRepository } from '@/lib/repository/AuditRepository';

export async function GET(req: Request) {
  try {
    const user = await requireAuthUserFromRequest(req);

    if (user.role !== 'COMPANY' || !user.companyId) {
      return NextResponse.json(
        {
          ok: false,
          error: 'forbidden',
        },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const filters = AuditRepository.parseFiltersFromSearchParams(searchParams);
    const result = await AuditRepository.findPagedForCompany(
      user.companyId,
      filters,
    );

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    console.error('GET /api/company/audit error:', error);

    return NextResponse.json(
      {
        ok: false,
        error: 'audit_fetch_failed',
      },
      { status: 500 },
    );
  }
}
