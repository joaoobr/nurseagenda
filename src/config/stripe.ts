// Stripe product/price mapping for NurseAgenda Pro
export const STRIPE_PLANS = {
  monthly: {
    priceId: 'price_1TJcqWAJzuBfJTxn4HX2Tzvx',
    productId: 'prod_UIDH9vGcamKztC',
    price: 5.50,
    interval: 'month' as const,
  },
  annual: {
    priceId: 'price_1TJcr1AJzuBfJTxn6RYfWpxY',
    productId: 'prod_UIDHfIePZzKu6E',
    price: 55.00,
    interval: 'year' as const,
  },
} as const;

export const getPlanByPriceId = (priceId: string) => {
  if (priceId === STRIPE_PLANS.monthly.priceId) return 'monthly';
  if (priceId === STRIPE_PLANS.annual.priceId) return 'annual';
  return null;
};
