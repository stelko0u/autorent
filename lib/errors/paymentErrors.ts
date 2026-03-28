export class InvalidTotalPriceError extends Error {
  readonly pricingDebug: {
    days: number;
    pricePerDay: number | string | null | undefined;
    totalPrice: number;
  };

  constructor(pricingDebug: InvalidTotalPriceError['pricingDebug']) {
    super('INVALID_TOTAL_PRICE');
    this.name = 'InvalidTotalPriceError';
    this.pricingDebug = pricingDebug;
  }
}

export class CompanyNoStripeAccountError extends Error {
  readonly company: { id: number; name?: string };

  constructor(company: CompanyNoStripeAccountError['company']) {
    super('COMPANY_HAS_NO_STRIPE_ACCOUNT');
    this.name = 'CompanyNoStripeAccountError';
    this.company = company;
  }
}

export class StripeAccountNotReadyError extends Error {
  readonly stripeDetails: {
    accountId: string;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    detailsSubmitted: boolean;
    disabledReason: string | null;
    currentlyDue: string[];
    pastDue: string[];
    capabilities: unknown;
  };

  constructor(stripeDetails: StripeAccountNotReadyError['stripeDetails']) {
    super('STRIPE_ACCOUNT_NOT_READY');
    this.name = 'StripeAccountNotReadyError';
    this.stripeDetails = stripeDetails;
  }
}

export class PaymentNotSuccessfulError extends Error {
  readonly paymentStatus: string;

  constructor(paymentStatus: string) {
    super('PAYMENT_NOT_SUCCESSFUL');
    this.name = 'PaymentNotSuccessfulError';
    this.paymentStatus = paymentStatus;
  }
}
