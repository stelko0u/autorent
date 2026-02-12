import { NextResponse } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
import {
  ReservationRepository,
  UserRepository,
  PaymentRepository,
  CarRepository,
  CompanyRepository,
} from '../../../lib/repositories';

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? 'token';

function getTokenFromRequest(req: Request) {
  const auth = req.headers.get('authorization');
  if (auth?.startsWith('Bearer ')) return auth.substring(7).trim();
  const cookieHeader = req.headers.get('cookie') || '';
  const match = cookieHeader.match(
    new RegExp(`(^|;\\s*)${COOKIE_NAME}=([^;]+)`),
  );
  return match ? decodeURIComponent(match[2]) : null;
}

async function getUserFromToken(req: Request) {
  if (!JWT_SECRET) return null;
  const token = getTokenFromRequest(req);
  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    const userId = Number(payload.userId ?? payload.sub);
    if (!userId || isNaN(userId)) return null;

    const user = await UserRepository.findById(userId);
    return user;
  } catch (err) {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromToken(req);
    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    const body = await req.json();
    const { reservationId, paymentMethod } = body;

    if (!reservationId) {
      return NextResponse.json(
        { ok: false, error: 'Reservation ID required' },
        { status: 400 },
      );
    }

    const reservation = await ReservationRepository.findById(
      Number(reservationId),
    );

    if (!reservation) {
      return NextResponse.json(
        { ok: false, error: 'Reservation not found' },
        { status: 404 },
      );
    }

    if (reservation.userId !== user.id) {
      return NextResponse.json(
        { ok: false, error: 'Unauthorized' },
        { status: 403 },
      );
    }

    // Get car to find company
    const car = await CarRepository.findById(reservation.carId);
    if (!car || !car.companyId) {
      return NextResponse.json(
        { ok: false, error: 'Car or company not found' },
        { status: 404 },
      );
    }

    // Get company to calculate fees
    const company = await CompanyRepository.findById(car.companyId);
    if (!company) {
      return NextResponse.json(
        { ok: false, error: 'Company not found' },
        { status: 404 },
      );
    }

    // Calculate platform fee and company earnings
    const platformFeePercent = company.maintenancePercent || 0;
    const platformFee = (reservation.totalPrice * platformFeePercent) / 100;
    const companyEarnings = reservation.totalPrice - platformFee;

    // Update reservation
    const paymentStatus = paymentMethod === 'ON_SPOT' ? 'PENDING' : 'PAID';
    const updated = await ReservationRepository.update(reservation.id, {
      paymentMethod: paymentMethod || 'CARD',
      paymentStatus,
      status: 'CONFIRMED',
    });

    // Create payment record
    const payment = await PaymentRepository.create({
      reservationId: reservation.id,
      companyId: car.companyId,
      amount: reservation.totalPrice,
      platformFee,
      companyEarnings,
      paymentMethod: paymentMethod || 'CARD',
      paymentStatus,
      paidAt: paymentMethod === 'CARD' ? new Date() : undefined,
    });

    return NextResponse.json({
      ok: true,
      reservation: updated,
      payment,
    });
  } catch (err) {
    console.error('POST /api/payments/confirm error:', err);
    return NextResponse.json(
      { ok: false, error: 'Server error' },
      { status: 500 },
    );
  }
}
