import Stripe from 'stripe';

let stripeClient: Stripe | null = null;

function getStripeClient() {
  if (stripeClient) return stripeClient;

  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecret) {
    throw new Error('stripe_not_configured');
  }

  stripeClient = new Stripe(stripeSecret);
  return stripeClient;
}

export async function createCompanyStripeAccount(input: {
  email: string;
  companyName: string;
}) {
  const stripe = getStripeClient();

  const account = await stripe.accounts.create({
    type: 'express',
    email: input.email,
    business_type: 'company',
    company: {
      name: input.companyName,
    },
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: {
      source: 'autorent_admin_onboarding',
    },
  });

  return account.id;
}

export async function rollbackStripeAccount(accountId: string) {
  if (!accountId) return;

  try {
    const stripe = getStripeClient();
    await stripe.accounts.del(accountId);
  } catch (err) {
    console.warn('Stripe rollback failed:', err);
  }
}
