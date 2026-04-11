// Stripe product/price mapping for NurseAgenda Pro (PRODUCTION)
export const STRIPE_PLANS = {
  monthly: {
    priceId: 'price_1TL8EqAJzuBfJTxnL1QGrJjd',
    productId: 'prod_UIDH9vGcamKztC', // TODO: update with production product ID
    price: 5.50,
    interval: 'month' as const,
  },
  annual: {
    priceId: 'price_1TL8FkAJzuBfJTxnBIX4D9a6',
    productId: 'prod_UIDHfIePZzKu6E', // TODO: update with production product ID
    price: 55.00,
    interval: 'year' as const,
  },
} as const;

export const getPlanByPriceId = (priceId: string) => {
  if (priceId === STRIPE_PLANS.monthly.priceId) return 'monthly';
  if (priceId === STRIPE_PLANS.annual.priceId) return 'annual';
  return null;
};
