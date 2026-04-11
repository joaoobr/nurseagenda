// Stripe product/price mapping for NurseAgenda Pro (PRODUCTION)
export const STRIPE_PLANS = {
  monthly: {
    priceId: 'price_1TL8EqAJzuBfJTxnL1QGrJjd',
    productId: 'prod_UJlm8m5AcKknBb',
    price: 5.50,
    interval: 'month' as const,
  },
  annual: {
    priceId: 'price_1TL8FkAJzuBfJTxnBIX4D9a6',
    productId: 'prod_UJln5k7VDPm0cY',
    price: 55.00,
    interval: 'year' as const,
  },
} as const;

export const getPlanByPriceId = (priceId: string) => {
  if (priceId === STRIPE_PLANS.monthly.priceId) return 'monthly';
  if (priceId === STRIPE_PLANS.annual.priceId) return 'annual';
  return null;
};
