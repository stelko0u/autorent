import { NextResponse } from 'next/server';
import { requireCompanyUser } from '@/lib/auth/requireCompany';
import { ReservationRepository } from '@/lib/repository/ReservationRepository';
import { CarRepository } from '@/lib/repository/CarRepository';

interface CancelRequestRouteContext {
  params: Promise<{ id: string }>;
}

type Action = 'approve' | 'reject';

function parseReservationId(raw: string): number | null {
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) return null;
  return value;
}

function parseAction(raw: unknown): Action | null {
  if (raw === 'approve' || raw === 'reject') return raw;
  return null;
}

export async function POST(req: Request, { params }: CancelRequestRouteContext) {
  try {
    const companyUser = await requireCompanyUser();
    const { id } = await params;
    const reservationId = parseReservationId(id);

    if (!reservationId) {
      return NextResponse.json(
        { ok: false, error: 'Invalid reservation ID' },
        { status: 400 },
      );
    }

    const body = (await req.json().catch(() => null)) as { action?: unknown } | null;
    const action = parseAction(body?.action);

    if (!action) {
      return NextResponse.json(
        { ok: false, error: 'Invalid action' },
        { status: 400 },
      );
    }

    const reservation = await ReservationRepository.findById(reservationId);

    if (!reservation) {
      return NextResponse.json(
        { ok: false, error: 'Reservation not found' },
        { status: 404 },
      );
    }

    const car = await CarRepository.findById(reservation.carId);

    if (!car || car.companyId !== companyUser.companyId) {
      return NextResponse.json(
        { ok: false, error: 'Reservation does not belong to your company' },
        { status: 403 },
      );
    }

    if (reservation.cancelRequestStatus !== 'PENDING') {
      return NextResponse.json(
        { ok: false, error: 'No pending cancellation request' },
        { status: 400 },
      );
    }

    const resolvedAt = new Date();

    const updated =
      action === 'approve'
        ? await ReservationRepository.update(reservationId, {
            status: 'CANCELLED',
            cancelRequestStatus: 'APPROVED',
            cancelRequestResolvedAt: resolvedAt,
          })
        : await ReservationRepository.update(reservationId, {
            cancelRequestStatus: 'REJECTED',
            cancelRequestResolvedAt: resolvedAt,
          });

    return NextResponse.json({ ok: true, reservation: updated });
  } catch (err) {
    console.error(
      'POST /api/company/reservations/[id]/cancel-request error:',
      err,
    );

    if (err instanceof Error) {
      if (err.message === 'FORBIDDEN') {
        return NextResponse.json(
          { ok: false, error: 'Forbidden - Company access required' },
          { status: 403 },
        );
      }

      if (err.message === 'MISSING_COMPANY_CONTEXT') {
        return NextResponse.json(
          { ok: false, error: 'Company context missing' },
          { status: 404 },
        );
      }
    }

    return NextResponse.json(
      { ok: false, error: 'Server error' },
      { status: 500 },
    );
  }
}
