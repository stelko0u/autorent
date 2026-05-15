import { NextResponse } from 'next/server';
import { confirmStripePayment } from '@/lib/services/payments/confirmStripePaymentService';
import { handleConfirmPaymentError } from '@/lib/errors/handleErrorPaymentError';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const paymentIntentId = String(body?.paymentIntentId || '');
    const localeCookie = req.headers
      .get('cookie')
      ?.split(';')
      .map((item) => item.trim())
      .find((item) => item.startsWith('locale='))
      ?.split('=')[1];
    const localeHeader = req.headers.get('x-locale');
    const locale =
      body?.locale === 'en'
        ? 'en'
        : localeHeader === 'en'
          ? 'en'
          : localeCookie === 'en'
            ? 'en'
            : 'bg';

    const result = await confirmStripePayment(paymentIntentId, locale);

    return NextResponse.json(result);
  } catch (err) {
    return handleConfirmPaymentError(err);
  }
}
