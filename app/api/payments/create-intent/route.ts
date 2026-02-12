// import { NextResponse } from 'next/server';
// import jwt, { JwtPayload } from 'jsonwebtoken';
// import {
//   ReservationRepository,
//   UserRepository,
// } from '../../../lib/repositories';

// const JWT_SECRET = process.env.JWT_SECRET;
// const COOKIE_NAME = process.env.AUTH_COOKIE_NAME ?? 'token';
// const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

// function getTokenFromRequest(req: Request) {
//   const auth = req.headers.get('authorization');
//   if (auth?.startsWith('Bearer ')) return auth.substring(7).trim();
//   const cookieHeader = req.headers.get('cookie') || '';
//   const match = cookieHeader.match(
//     new RegExp(`(^|;\\s*)${COOKIE_NAME}=([^;]+)`),
//   );
//   return match ? decodeURIComponent(match[2]) : null;
// }

// async function getUserFromToken(req: Request) {
//   if (!JWT_SECRET) return null;
//   const token = getTokenFromRequest(req);
//   if (!token) return null;

//   try {
//     const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
//     const userId = Number(payload.userId ?? payload.sub);
//     if (!userId || isNaN(userId)) return null;

//     const user = await UserRepository.findById(userId);
//     return user;
//   } catch (err) {
//     return null;
//   }
// }

// export async function POST(req: Request) {
//   try {
//     const user = await getUserFromToken(req);
//     if (!user) {
//       return NextResponse.json(
//         { ok: false, error: 'Unauthorized' },
//         { status: 401 },
//       );
//     }

//     const body = await req.json();
//     const { reservationId } = body;

//     if (!reservationId) {
//       return NextResponse.json(
//         { ok: false, error: 'Reservation ID required' },
//         { status: 400 },
//       );
//     }

//     const reservation = await ReservationRepository.findById(
//       Number(reservationId),
//     );

//     if (!reservation) {
//       return NextResponse.json(
//         { ok: false, error: 'Reservation not found' },
//         { status: 404 },
//       );
//     }

//     if (reservation.userId !== user.id) {
//       return NextResponse.json(
//         { ok: false, error: 'Unauthorized' },
//         { status: 403 },
//       );
//     }

//     if (reservation.paymentStatus === 'PAID') {
//       return NextResponse.json(
//         { ok: false, error: 'Reservation already paid' },
//         { status: 400 },
//       );
//     }

//     // Stripe интеграция (ако имате Stripe)
//     if (STRIPE_SECRET_KEY) {
//       // TODO: Имплементация с реален Stripe
//       // const stripe = require('stripe')(STRIPE_SECRET_KEY);
//       // const paymentIntent = await stripe.paymentIntents.create({
//       //   amount: Math.round(reservation.totalPrice * 100),
//       //   currency: 'bgn',
//       //   metadata: { reservationId: reservation.id },
//       // });

//       // За момента връщаме mock данни
//       return NextResponse.json({
//         ok: true,
//         clientSecret: 'mock_client_secret_' + reservation.id,
//         amount: reservation.totalPrice,
//       });
//     }

//     return NextResponse.json(
//       { ok: false, error: 'Payment service not configured' },
//       { status: 500 },
//     );
//   } catch (err) {
//     console.error('POST /api/payments/create-intent error:', err);
//     return NextResponse.json(
//       { ok: false, error: 'Server error' },
//       { status: 500 },
//     );
//   }
// }
