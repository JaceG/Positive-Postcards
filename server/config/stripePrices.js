/**
 * Stripe Price Configuration
 * 
 * These are the live Stripe price IDs created by setupStripeProducts.js
 * Update these if you recreate prices in Stripe
 */

const STRIPE_PRICES = {
  // Individual subscription prices
  individual_monthly: 'price_1Sr4BmB1RmaIBRsQQrbfvoU8',      // $120/month
  individual_quarterly: 'price_1Sr4BmB1RmaIBRsQf4U5Ki64',    // $198/quarter
  individual_annual: 'price_1Sr4BmB1RmaIBRsQ7kUYMa0p',       // $720/year

  // Promotional prices
  promo_trial_7days: 'price_1Sr4BnB1RmaIBRsQIytRwOti',       // $7 for 7 days
  promo_first_month_half: 'price_1Sr4BnB1RmaIBRsQKbOzWsqf',  // $60 (50% off first month)
  promo_downsell_monthly: 'price_1Sr4BoB1RmaIBRsQkDV8zRkf',  // $90 (25% off)

  // Business prices (per employee)
  business_starter: 'price_1Sr4BoB1RmaIBRsQ62ApPhRe',        // $90/person/month
  business_growth: 'price_1Sr4BpB1RmaIBRsQZCZKF1s0',         // $80/person/month
};

// Product IDs
const STRIPE_PRODUCTS = {
  individual: 'prod_TohaAfB7eFvRTp',
  business: 'prod_TohbxDQgkXxeE4',
};

// Price amounts (in cents) for reference
const PRICE_AMOUNTS = {
  individual_monthly: 12000,      // $120
  individual_quarterly: 19800,    // $198
  individual_annual: 72000,       // $720
  promo_trial_7days: 700,         // $7
  promo_first_month_half: 6000,   // $60
  promo_downsell_monthly: 9000,   // $90
  business_starter: 9000,         // $90/person
  business_growth: 8000,          // $80/person
};

module.exports = {
  STRIPE_PRICES,
  STRIPE_PRODUCTS,
  PRICE_AMOUNTS,
};
