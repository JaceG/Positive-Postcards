#!/usr/bin/env node
/**
 * Stripe Products Setup Script
 * 
 * Creates all products and prices in Stripe for Positive Postcards
 * Run with: node server/scripts/setupStripeProducts.js
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// ============================================
// PRODUCT & PRICE DEFINITIONS
// ============================================

const PRODUCTS = {
  individual: {
    name: 'Positive Postcards - Individual Subscription',
    description: 'Daily affirmation postcards delivered to your door. Start each day with positivity!',
    metadata: {
      type: 'individual',
      postcards_per_month: '30',
    },
  },
  business: {
    name: 'Positive Postcards - Business Subscription',
    description: 'Employee wellness through daily positive postcards. Boost morale and engagement.',
    metadata: {
      type: 'business',
    },
  },
};

// Individual subscription prices (matching Pricing.tsx)
const INDIVIDUAL_PRICES = [
  {
    nickname: 'monthly',
    unit_amount: 12000, // $120.00
    currency: 'usd',
    recurring: {
      interval: 'month',
      interval_count: 1,
    },
    metadata: {
      display_name: 'Monthly',
      original_price: '150',
      per_day: '4.00',
      postcards: '30',
    },
  },
  {
    nickname: 'quarterly',
    unit_amount: 19800, // $198.00
    currency: 'usd',
    recurring: {
      interval: 'month',
      interval_count: 3,
    },
    metadata: {
      display_name: 'Quarterly',
      original_price: '360',
      per_day: '2.20',
      savings: '45%',
      postcards: '90',
    },
  },
  {
    nickname: 'annual',
    unit_amount: 72000, // $720.00
    currency: 'usd',
    recurring: {
      interval: 'year',
      interval_count: 1,
    },
    metadata: {
      display_name: 'Annual',
      original_price: '1440',
      per_day: '2.00',
      savings: '50%',
      postcards: '365',
      founding_member: 'true',
    },
  },
];

// Promotional/trial prices
const PROMOTIONAL_PRICES = [
  {
    nickname: 'trial_7days',
    unit_amount: 700, // $7.00
    currency: 'usd',
    recurring: {
      interval: 'day',
      interval_count: 7,
    },
    metadata: {
      type: 'trial',
      display_name: '7-Day Trial',
      description: '7 days for $7',
      postcards: '7',
    },
  },
  {
    nickname: 'first_month_50off',
    unit_amount: 6000, // $60.00 (50% off $120)
    currency: 'usd',
    recurring: {
      interval: 'month',
      interval_count: 1,
    },
    metadata: {
      type: 'promotional',
      display_name: 'First Month - 50% Off',
      description: 'First month at half price',
      regular_price_cents: '12000',
      discount_percent: '50',
    },
  },
  {
    nickname: 'downsell_monthly',
    unit_amount: 9000, // $90.00 (25% off $120)
    currency: 'usd',
    recurring: {
      interval: 'month',
      interval_count: 1,
    },
    metadata: {
      type: 'downsell',
      display_name: 'Special Offer - 25% Off',
      description: 'Exit intent offer',
      regular_price_cents: '12000',
      discount_percent: '25',
    },
  },
];

// Business subscription prices (per employee/month)
const BUSINESS_PRICES = [
  {
    nickname: 'business_starter',
    unit_amount: 9000, // $90.00 per person/month
    currency: 'usd',
    recurring: {
      interval: 'month',
      interval_count: 1,
    },
    metadata: {
      tier: 'starter',
      display_name: 'Starter',
      employee_range: '10-50',
      per_person: 'true',
    },
  },
  {
    nickname: 'business_growth',
    unit_amount: 8000, // $80.00 per person/month
    currency: 'usd',
    recurring: {
      interval: 'month',
      interval_count: 1,
    },
    metadata: {
      tier: 'growth',
      display_name: 'Growth',
      employee_range: '51-200',
      per_person: 'true',
    },
  },
];

// ============================================
// SETUP FUNCTIONS
// ============================================

async function findOrCreateProduct(productData) {
  console.log(`\n  Looking for product: ${productData.name}`);
  
  // Search for existing product
  const existingProducts = await stripe.products.search({
    query: `name:"${productData.name}"`,
  });

  if (existingProducts.data.length > 0) {
    console.log(`  Found existing product: ${existingProducts.data[0].id}`);
    return existingProducts.data[0];
  }

  // Create new product
  const product = await stripe.products.create({
    name: productData.name,
    description: productData.description,
    metadata: productData.metadata,
  });
  
  console.log(`  Created new product: ${product.id}`);
  return product;
}

async function findOrCreatePrice(productId, priceData) {
  console.log(`    Looking for price: ${priceData.nickname}`);
  
  // List existing prices for this product
  const existingPrices = await stripe.prices.list({
    product: productId,
    active: true,
    limit: 100,
  });

  // Check if a matching price exists
  const existingPrice = existingPrices.data.find(p => 
    p.nickname === priceData.nickname &&
    p.unit_amount === priceData.unit_amount &&
    p.recurring?.interval === priceData.recurring?.interval &&
    p.recurring?.interval_count === priceData.recurring?.interval_count
  );

  if (existingPrice) {
    console.log(`    Found existing price: ${existingPrice.id}`);
    return existingPrice;
  }

  // Create new price
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: priceData.unit_amount,
    currency: priceData.currency,
    recurring: priceData.recurring,
    nickname: priceData.nickname,
    metadata: priceData.metadata,
  });
  
  console.log(`    Created new price: ${price.id}`);
  return price;
}

async function setupStripeProducts() {
  console.log('\n========================================');
  console.log('Positive Postcards - Stripe Setup');
  console.log('========================================');
  
  // Check environment
  const isLive = process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_');
  console.log(`\nMode: ${isLive ? '🔴 LIVE' : '🟡 TEST'}`);
  
  if (isLive) {
    console.log('\n⚠️  WARNING: You are setting up LIVE Stripe products!');
    console.log('    These will be visible to real customers.\n');
  }

  const results = {
    products: {},
    prices: {},
  };

  try {
    // ============================================
    // 1. INDIVIDUAL SUBSCRIPTION PRODUCT
    // ============================================
    console.log('\n📦 Setting up Individual Subscription Product...');
    
    const individualProduct = await findOrCreateProduct(PRODUCTS.individual);
    results.products.individual = individualProduct.id;

    // Create individual prices
    console.log('\n  💰 Creating Individual Prices...');
    for (const priceData of INDIVIDUAL_PRICES) {
      const price = await findOrCreatePrice(individualProduct.id, priceData);
      results.prices[`individual_${priceData.nickname}`] = price.id;
    }

    // Create promotional prices
    console.log('\n  🎁 Creating Promotional Prices...');
    for (const priceData of PROMOTIONAL_PRICES) {
      const price = await findOrCreatePrice(individualProduct.id, priceData);
      results.prices[`promo_${priceData.nickname}`] = price.id;
    }

    // ============================================
    // 2. BUSINESS SUBSCRIPTION PRODUCT
    // ============================================
    console.log('\n📦 Setting up Business Subscription Product...');
    
    const businessProduct = await findOrCreateProduct(PRODUCTS.business);
    results.products.business = businessProduct.id;

    // Create business prices
    console.log('\n  💰 Creating Business Prices...');
    for (const priceData of BUSINESS_PRICES) {
      const price = await findOrCreatePrice(businessProduct.id, priceData);
      results.prices[`business_${priceData.nickname}`] = price.id;
    }

    // ============================================
    // 3. SUMMARY
    // ============================================
    console.log('\n========================================');
    console.log('✅ Setup Complete!');
    console.log('========================================');
    
    console.log('\n📋 Products Created/Found:');
    for (const [key, id] of Object.entries(results.products)) {
      console.log(`   ${key}: ${id}`);
    }

    console.log('\n💰 Prices Created/Found:');
    for (const [key, id] of Object.entries(results.prices)) {
      console.log(`   ${key}: ${id}`);
    }

    // Output config for server
    console.log('\n📝 Add these Price IDs to your server configuration:');
    console.log('========================================');
    console.log(JSON.stringify(results.prices, null, 2));
    console.log('========================================');

    return results;

  } catch (error) {
    console.error('\n❌ Error during setup:', error.message);
    throw error;
  }
}

// ============================================
// RUN SCRIPT
// ============================================

if (require.main === module) {
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('❌ STRIPE_SECRET_KEY not found in environment variables');
    console.error('   Make sure you have a .env file with your Stripe secret key');
    process.exit(1);
  }

  setupStripeProducts()
    .then(() => {
      console.log('\n✨ All done! Your Stripe products are ready.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Setup failed:', error);
      process.exit(1);
    });
}

module.exports = { setupStripeProducts };
