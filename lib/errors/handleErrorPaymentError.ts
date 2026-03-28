import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import {
  CompanyNoStripeAccountError,
  InvalidTotalPriceError,
  PaymentNotSuccessfulError,
  StripeAccountNotReadyError,
} from '@/lib/errors/paymentErrors';

export function handleCreatePaymentIntentError(err: unknown) {
  console.error('Create Payment Intent Error:', err);

  if (err instanceof Stripe.errors.StripeError) {
    return NextResponse.json(
      {
        ok: false,
        error: err.message,
        code: err.code ?? null,
        type: err.type ?? null,
      },
      { status: err.statusCode ?? 400 },
    );
  }

  if (err instanceof Error) {
    if (err.message === 'MISSING_RESERVATION_ID') {
      return NextResponse.json(
        { ok: false, error: 'Missing reservation ID' },
        { status: 400 },
      );
    }

    if (err.message === 'RESERVATION_NOT_FOUND') {
      return NextResponse.json(
        { ok: false, error: 'Reservation not found' },
        { status: 404 },
      );
    }

    if (err.message === 'CAR_NOT_FOUND') {
      return NextResponse.json(
        { ok: false, error: 'Car not found' },
        { status: 404 },
      );
    }

    if (err.message === 'CAR_HAS_NO_COMPANY') {
      return NextResponse.json(
        { ok: false, error: 'Car has no company attached' },
        { status: 400 },
      );
    }

    if (err.message === 'COMPANY_NOT_FOUND') {
      return NextResponse.json(
        { ok: false, error: 'Company not found' },
        { status: 404 },
      );
    }

    if (err instanceof CompanyNoStripeAccountError) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Company has no Stripe account connected',
          debug: err.company,
        },
        { status: 400 },
      );
    }

    if (err instanceof StripeAccountNotReadyError) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Company Stripe account is not ready for payments',
          onboardingRequired: true,
          stripe: err.stripeDetails,
        },
        { status: 400 },
      );
    }

    if (err instanceof InvalidTotalPriceError) {
      return NextResponse.json(
        {
          ok: false,
          error: 'Invalid total price',
          debug: err.pricingDebug,
        },
        { status: 400 },
      );
    }

    if (err.message === 'INVALID_RESERVATION_DATES') {
      return NextResponse.json(
        { ok: false, error: 'Invalid reservation dates' },
        { status: 400 },
      );
    }
  }

  return NextResponse.json(
    {
      ok: false,
      error: 'Failed to create payment intent',
      details: (err as Error)?.message,
    },
    { status: 500 },
  );
}

export function handleConfirmPaymentError(err: unknown) {
  console.error('Confirm Payment Error:', err);

  if (err instanceof Stripe.errors.StripeError) {
    return NextResponse.json(
      {
        ok: false,
        error: err.message,
        code: err.code ?? null,
        type: err.type ?? null,
      },
      { status: err.statusCode ?? 400 },
    );
  }

  if (err instanceof PaymentNotSuccessfulError) {
    return NextResponse.json(
      { ok: false, error: 'Payment not successful', paymentStatus: err.paymentStatus },
      { status: 400 },
    );
  }

  if (err instanceof Error) {
    if (err.message === 'MISSING_PAYMENT_INTENT_ID') {
      return NextResponse.json(
        { ok: false, error: 'Missing payment intent ID' },
        { status: 400 },
      );
    }

    if (err.message === 'INVALID_RESERVATION_ID') {
      return NextResponse.json(
        { ok: false, error: 'Invalid reservation ID' },
        { status: 400 },
      );
    }

    if (err.message === 'RESERVATION_NOT_FOUND') {
      return NextResponse.json(
        { ok: false, error: 'Reservation not found' },
        { status: 404 },
      );
    }

    if (err.message === 'CAR_NOT_FOUND') {
      return NextResponse.json(
        { ok: false, error: 'Car not found' },
        { status: 404 },
      );
    }

    if (err.message === 'COMPANY_NOT_FOUND') {
      return NextResponse.json(
        { ok: false, error: 'Company not found' },
        { status: 404 },
      );
    }
  }

  return NextResponse.json(
    {
      ok: false,
      error: 'Failed to confirm payment',
      details: (err as Error)?.message,
    },
    { status: 500 },
  );
}
