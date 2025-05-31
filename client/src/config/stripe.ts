import { loadStripe } from '@stripe/stripe-js';

// Load Stripe publishable key from environment variables
const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || '';

if (!stripePublishableKey && process.env.NODE_ENV === 'production') {
	console.warn('Stripe publishable key is not set in environment variables');
}

// Initialize Stripe with your publishable key
export const stripePromise = loadStripe(stripePublishableKey);

// Helper to check if we're using test mode
export const isTestMode = stripePublishableKey?.startsWith('pk_test_') ?? true;

// Stripe configuration
export const STRIPE_CONFIG = {
	currency: 'usd',
	locale: 'en-US' as const,
};
