import { NextResponse } from 'next/server';
import { AuthError, requireAuthUserFromRequest } from '@/lib/auth';
import { ReservationRepository } from '@/lib/repository/ReservationRepository';

type Params = Promise<{ id: string }>;

function parseReservationId(raw: string): number | null {
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) return null;
  return value;
}

export async function POST(req: Request, { params }: { params: Params }) {
  try {
    const user = await requireAuthUserFromRequest(req);
    const { id } = await params;
    const reservationId = parseReservationId(id);

    if (!reservationId) {
      return NextResponse.json(
        { ok: false, error: 'Invalid reservation ID' },
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

    if (reservation.userId !== user.id) {
      return NextResponse.json(
        { ok: false, error: 'Forbidden' },
        { status: 403 },
      );
    }

    // Allow requesting cancellation only before the rental starts.
    if (!['PENDING', 'CONFIRMED'].includes(reservation.status)) {
      return NextResponse.json(
        { ok: false, error: 'Reservation cannot be cancelled in this state' },
        { status: 400 },
      );
    }

    if (reservation.cancelRequestStatus === 'PENDING') {
      return NextResponse.json({ ok: true, reservation });
    }

    const updated = await ReservationRepository.update(reservationId, {
      cancelRequestStatus: 'PENDING',
      cancelRequestedAt: new Date(),
      cancelRequestResolvedAt: null,
    });

    return NextResponse.json({ ok: true, reservation: updated });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { ok: false, error: err.message },
        { status: err.status },
      );
    }

    console.error('POST /api/user/reservations/[id]/cancel-request error:', err);
    return NextResponse.json(
      { ok: false, error: 'Server error' },
      { status: 500 },
    );
  }
}
