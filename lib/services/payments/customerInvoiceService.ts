import { createCustomerPaymentStripeInvoice } from '@/lib/services/stripe/customerInvoices';
import { sendCustomerPaymentInvoiceEmail } from '@/lib/mail/sendCustomerPaymentInvoiceEmail';
import type Stripe from 'stripe';
import type { Company, Reservation, Car } from '@/types/database';

type Input = {
  company: Company;
  reservation: Reservation & { locale?: 'bg' | 'en' };
  car: Car;
  paymentIntentId: string;
  chargeId: string;
  totalAmount: number;
  platformFee: number;
  companyEarnings: number;
  paidAt: Date;
};

export async function tryCreateAndSendCustomerInvoice(input: Input) {
  const locale = input.reservation?.locale === 'en' ? 'en' : 'bg';
  let stripeInvoice: Stripe.Invoice | null = null;
  let invoiceEmailSent = false;
  let invoiceWarning: string | null = null;

  try {
    stripeInvoice = await createCustomerPaymentStripeInvoice({
      company: input.company,
      reservation: input.reservation,
      car: input.car,
      paymentIntentId: input.paymentIntentId,
      chargeId: input.chargeId,
      amountPaid: input.totalAmount,
      platformFee: input.platformFee,
      companyEarnings: input.companyEarnings,
    });

    await sendCustomerPaymentInvoiceEmail(
      {
        reservation: {
          id: input.reservation.id,
          firstName: input.reservation.firstName,
          lastName: input.reservation.lastName,
          email: input.reservation.email,
          startDate: input.reservation.startDate,
          endDate: input.reservation.endDate,
        },
        car: {
          make: input.car.make,
          model: input.car.model,
          year: input.car.year,
          pricePerDay: input.car.pricePerDay,
        },
        company: {
          id: input.company.id,
          name: input.company.name,
          email: input.company.email,
          maintenancePercent: input.company.maintenancePercent,
        },
        payment: {
          amountPaid: input.totalAmount,
          platformFee: input.platformFee,
          companyEarnings: input.companyEarnings,
          paidAt: input.paidAt,
          paymentIntentId: input.paymentIntentId,
          chargeId: input.chargeId,
        },
        stripeInvoice: stripeInvoice
          ? {
              id: stripeInvoice.id,
              number: stripeInvoice.number,
              hosted_invoice_url: stripeInvoice.hosted_invoice_url,
              invoice_pdf: stripeInvoice.invoice_pdf,
            }
          : null,
      },
      locale,
    );

    invoiceEmailSent = true;
  } catch (invoiceErr: unknown) {
    console.error('Failed to create/send customer invoice:', invoiceErr);
    invoiceWarning =
      invoiceErr instanceof Error ? invoiceErr.message : 'Invoice/email could not be generated';
  }

  return {
    stripeInvoice,
    invoiceEmailSent,
    invoiceWarning,
  };
}
