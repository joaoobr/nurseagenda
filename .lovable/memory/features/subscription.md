---
name: Subscription & Trial System
description: 3-day free trial, then paywall blocks premium routes. Stripe monthly ($5.50) and annual ($55)
type: feature
---
- Trial: 3 days from user.created_at, calculated client-side in AuthContext
- After trial: all premium routes blocked by SubscriptionGate component
- Free routes (always accessible): /, /subscription, /profile, /more, /settings, /notifications, /about, /admin
- Premium routes (gated): /schedule, /patients, /medications, /calculator, /nursing-notes, /vital-signs, /checklists
- Stripe products: prod_UIDH9vGcamKztC (monthly), prod_UIDHfIePZzKu6E (annual)
- Stripe prices: price_1TJcqWAJzuBfJTxn4HX2Tzvx (monthly $5.50), price_1TJcr1AJzuBfJTxn6RYfWpxY (annual $55)
- Edge functions: check-subscription, create-checkout, customer-portal
- TrialBanner shown on home during trial period
- Paywall component shown when trial expired and no subscription
- AuthContext exposes: hasAccess, trialDaysLeft, isTrialExpired
