const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios'); // Add axios for Google Places API calls
const emailService = require('./services/emailService'); // Add email service
const postcardManiaService = require('./services/postcardManiaService'); // Add PCM service

// Check if Stripe secret key is available
if (!process.env.STRIPE_SECRET_KEY) {
	console.error(
		'ERROR: STRIPE_SECRET_KEY is not set in environment variables'
	);
	console.error(
		'Please ensure you have a .env file in the parent directory with STRIPE_SECRET_KEY'
	);
	process.exit(1);
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const app = express();
const PORT = process.env.PORT || 3001;

// Set NODE_ENV to production if running on Render (port 10000)
if (PORT == 10000 && !process.env.NODE_ENV) {
	process.env.NODE_ENV = 'production';
}

// Middleware
app.use(
	cors({
		origin:
			process.env.NODE_ENV === 'production'
				? 'https://positive-postcards.onrender.com'
				: 'http://localhost:3000',
		credentials: true,
	})
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
	res.json({
		status: 'Server is running',
		mode: process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')
			? 'test'
			: 'live',
		timestamp: new Date().toISOString(),
	});
});

// Create payment intent for one-time payments
app.post('/api/create-payment-intent', async (req, res) => {
	try {
		const { amount, currency = 'usd', metadata = {} } = req.body;

		// Create a PaymentIntent with the order amount and currency
		const paymentIntent = await stripe.paymentIntents.create({
			amount: Math.round(amount * 100), // Stripe expects amounts in cents
			currency,
			automatic_payment_methods: {
				enabled: true,
			},
			metadata,
		});

		res.json({
			clientSecret: paymentIntent.client_secret,
			paymentIntentId: paymentIntent.id,
		});
	} catch (error) {
		console.error('Error creating payment intent:', error);
		res.status(500).json({ error: error.message });
	}
});

// Create subscription
app.post('/api/create-subscription', async (req, res) => {
	try {
		const {
			email,
			paymentMethodId,
			priceId,
			billingCycle,
			isGift = false,
			recipientInfo,
			businessInfo,
			metadata = {},
		} = req.body;

		// Create or retrieve customer
		let customer;
		const existingCustomers = await stripe.customers.list({
			email,
			limit: 1,
		});

		if (existingCustomers.data.length > 0) {
			customer = existingCustomers.data[0];
		} else {
			customer = await stripe.customers.create({
				email,
				payment_method: paymentMethodId,
				invoice_settings: {
					default_payment_method: paymentMethodId,
				},
				metadata: {
					...metadata,
					isGift: isGift.toString(),
				},
			});
		}

		// Attach payment method to customer
		await stripe.paymentMethods.attach(paymentMethodId, {
			customer: customer.id,
		});

		// Create subscription with the appropriate price
		const subscription = await stripe.subscriptions.create({
			customer: customer.id,
			items: [{ price: priceId }],
			default_payment_method: paymentMethodId,
			metadata: {
				billingCycle,
				isGift: isGift.toString(),
				...(recipientInfo && {
					recipientInfo: JSON.stringify(recipientInfo),
				}),
				...(businessInfo && {
					businessInfo: JSON.stringify(businessInfo),
				}),
			},
			expand: ['latest_invoice.payment_intent'],
		});

		res.json({
			subscriptionId: subscription.id,
			clientSecret:
				subscription.latest_invoice.payment_intent.client_secret,
			status: subscription.status,
		});
	} catch (error) {
		console.error('Error creating subscription:', error);
		res.status(500).json({ error: error.message });
	}
});

// Get subscription prices (create them if they don't exist)
app.get('/api/prices', async (req, res) => {
	try {
		// Define your subscription products
		const products = {
			individual: {
				name: 'Positive Postcards Individual Subscription',
				description:
					'Daily affirmation postcards delivered to your door',
			},
			business: {
				name: 'Positive Postcards Business Subscription',
				description:
					'Employee wellness through daily positive postcards',
			},
		};

		// Define your pricing tiers
		const pricingTiers = [
			{ nickname: 'monthly', amount: 6000, interval: 'month' },
			{
				nickname: 'quarterly',
				amount: 9900,
				interval: 'month',
				interval_count: 3,
			},
			{ nickname: 'annual', amount: 36000, interval: 'year' },
		];

		// Define promotional prices
		const promotionalPrices = [
			{
				nickname: 'trial_7days',
				amount: 700, // $7 for 7 days
				trial_period_days: 7,
				interval: 'month',
				metadata: {
					type: 'trial',
					description: '7 days for $7',
				},
			},
			{
				nickname: 'first_month_half',
				amount: 3750, // $37.50 for first month (50% off)
				interval: 'month',
				metadata: {
					type: 'promotional',
					description: 'First month 50% off',
					regular_price_after: '6000',
				},
			},
		];

		// Get or create products
		const stripeProducts = {};
		for (const [key, productData] of Object.entries(products)) {
			const existingProducts = await stripe.products.search({
				query: `name:"${productData.name}"`,
			});

			if (existingProducts.data.length > 0) {
				stripeProducts[key] = existingProducts.data[0];
			} else {
				stripeProducts[key] = await stripe.products.create({
					name: productData.name,
					description: productData.description,
				});
			}
		}

		// Get or create regular prices
		const prices = {};
		for (const tier of pricingTiers) {
			const priceKey = `individual_${tier.nickname}`;
			const existingPrices = await stripe.prices.list({
				product: stripeProducts.individual.id,
				active: true,
			});

			const existingPrice = existingPrices.data.find(
				(p) =>
					p.nickname === tier.nickname &&
					p.unit_amount === tier.amount
			);

			if (existingPrice) {
				prices[priceKey] = existingPrice;
			} else {
				prices[priceKey] = await stripe.prices.create({
					product: stripeProducts.individual.id,
					unit_amount: tier.amount,
					currency: 'usd',
					recurring: {
						interval: tier.interval,
						interval_count: tier.interval_count || 1,
					},
					nickname: tier.nickname,
				});
			}
		}

		// Get or create promotional prices
		for (const promo of promotionalPrices) {
			const priceKey = `promo_${promo.nickname}`;
			const existingPrices = await stripe.prices.list({
				product: stripeProducts.individual.id,
				active: true,
			});

			const existingPrice = existingPrices.data.find(
				(p) =>
					p.nickname === promo.nickname &&
					p.unit_amount === promo.amount
			);

			if (existingPrice) {
				prices[priceKey] = existingPrice;
			} else {
				const priceData = {
					product: stripeProducts.individual.id,
					unit_amount: promo.amount,
					currency: 'usd',
					recurring: {
						interval: promo.interval,
						interval_count: promo.interval_count || 1,
					},
					nickname: promo.nickname,
					metadata: promo.metadata,
				};

				// Add trial period if specified
				if (promo.trial_period_days) {
					priceData.recurring.trial_period_days =
						promo.trial_period_days;
				}

				prices[priceKey] = await stripe.prices.create(priceData);
			}
		}

		res.json({
			products: stripeProducts,
			prices,
		});
	} catch (error) {
		console.error('Error fetching prices:', error);
		res.status(500).json({ error: error.message });
	}
});

// Cancel subscription
app.post('/api/cancel-subscription', async (req, res) => {
	try {
		const { subscriptionId } = req.body;

		const deletedSubscription = await stripe.subscriptions.update(
			subscriptionId,
			{ cancel_at_period_end: true }
		);

		res.json({
			subscription: deletedSubscription,
			message:
				'Subscription will be canceled at the end of the billing period',
		});
	} catch (error) {
		console.error('Error canceling subscription:', error);
		res.status(500).json({ error: error.message });
	}
});

// Simple in-memory session store (in production, use Redis or similar)
const sessions = new Map();

// Generate magic link
app.post('/api/auth/send-magic-link', async (req, res) => {
	try {
		const { email } = req.body;

		if (!email || !email.includes('@')) {
			return res.status(400).json({ error: 'Valid email required' });
		}

		// Check if customer exists in Stripe
		const customers = await stripe.customers.list({
			email,
			limit: 1,
		});

		if (customers.data.length === 0) {
			return res
				.status(404)
				.json({ error: 'No account found with this email' });
		}

		// Generate magic link token
		const token =
			Math.random().toString(36).substring(2) + Date.now().toString(36);
		const expires = Date.now() + 15 * 60 * 1000; // 15 minutes

		// Store token (in production, use Redis or database)
		sessions.set(token, {
			email,
			customerId: customers.data[0].id,
			expires,
		});

		// Create magic link URL
		const baseUrl =
			process.env.NODE_ENV === 'production'
				? 'https://positive-postcards.onrender.com'
				: 'http://localhost:3000';
		const magicLink = `${baseUrl}/auth/verify?token=${token}`;

		// Send email via Postmark
		try {
			const emailResult = await emailService.sendMagicLink(
				email,
				magicLink
			);

			if (emailResult.demo) {
				// In demo mode, return the link for testing
				res.json({
					success: true,
					message: 'Check your email for the login link',
					demoLink: emailResult.link,
				});
			} else {
				// In production, just confirm email was sent
				res.json({
					success: true,
					message: 'Check your email for the login link',
					messageId: emailResult.messageId,
				});
			}
		} catch (emailError) {
			console.error('Email sending failed:', emailError);
			// Fallback to demo mode if email fails
			res.json({
				success: true,
				message: 'Check your email for the login link',
				demoLink: magicLink,
				warning: 'Email service unavailable, showing demo link',
			});
		}
	} catch (error) {
		console.error('Error sending magic link:', error);
		res.status(500).json({ error: 'Failed to send login link' });
	}
});

// Verify magic link and create session
app.get('/api/auth/verify', async (req, res) => {
	try {
		const { token } = req.query;

		if (!token) {
			return res.status(400).json({ error: 'Token required' });
		}

		const session = sessions.get(token);

		if (!session || session.expires < Date.now()) {
			sessions.delete(token);
			return res.status(401).json({ error: 'Invalid or expired token' });
		}

		// Create a new session token
		const sessionToken =
			Math.random().toString(36).substring(2) + Date.now().toString(36);
		sessions.set(sessionToken, {
			email: session.email,
			customerId: session.customerId,
			expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
		});

		// Delete the magic link token
		sessions.delete(token);

		res.json({
			success: true,
			sessionToken,
			email: session.email,
			customerId: session.customerId,
		});
	} catch (error) {
		console.error('Error verifying magic link:', error);
		res.status(500).json({ error: 'Failed to verify login link' });
	}
});

// Middleware to verify session
const requireAuth = (req, res, next) => {
	const token = req.headers.authorization?.replace('Bearer ', '');

	if (!token) {
		return res.status(401).json({ error: 'Authentication required' });
	}

	const session = sessions.get(token);

	if (!session || session.expires < Date.now()) {
		sessions.delete(token);
		return res.status(401).json({ error: 'Session expired' });
	}

	req.user = session;
	next();
};

// Get customer dashboard data
app.get('/api/dashboard', requireAuth, async (req, res) => {
	try {
		const { customerId } = req.user;

		// Get customer and subscriptions from Stripe
		const customer = await stripe.customers.retrieve(customerId, {
			expand: ['subscriptions'],
		});

		res.json({
			customer: {
				email: customer.email,
				created: customer.created,
				metadata: customer.metadata,
			},
			subscriptions: customer.subscriptions.data,
		});
	} catch (error) {
		console.error('Error fetching dashboard data:', error);
		res.status(500).json({ error: 'Failed to fetch dashboard data' });
	}
});

// Create Stripe billing portal session
app.post('/api/create-portal-session', requireAuth, async (req, res) => {
	try {
		const { customerId } = req.user;
		const { returnUrl } = req.body;

		const session = await stripe.billingPortal.sessions.create({
			customer: customerId,
			return_url: returnUrl || 'http://localhost:3000/dashboard',
		});

		res.json({ url: session.url });
	} catch (error) {
		console.error('Error creating portal session:', error);
		res.status(500).json({
			error: 'Failed to create billing portal session',
		});
	}
});

// Pause/resume subscription
app.post('/api/subscription/pause', requireAuth, async (req, res) => {
	try {
		const { subscriptionId, resumeDate } = req.body;

		// Verify subscription belongs to user
		const subscription = await stripe.subscriptions.retrieve(
			subscriptionId
		);
		if (subscription.customer !== req.user.customerId) {
			return res.status(403).json({ error: 'Unauthorized' });
		}

		// Pause subscription using Stripe's pause collection feature
		const updatedSubscription = await stripe.subscriptions.update(
			subscriptionId,
			{
				pause_collection: {
					behavior: 'void',
					resumes_at: resumeDate
						? Math.floor(new Date(resumeDate).getTime() / 1000)
						: undefined,
				},
			}
		);

		res.json({ subscription: updatedSubscription });
	} catch (error) {
		console.error('Error pausing subscription:', error);
		res.status(500).json({ error: 'Failed to pause subscription' });
	}
});

// Resume subscription
app.post('/api/subscription/resume', requireAuth, async (req, res) => {
	try {
		const { subscriptionId } = req.body;

		// Verify subscription belongs to user
		const subscription = await stripe.subscriptions.retrieve(
			subscriptionId
		);
		if (subscription.customer !== req.user.customerId) {
			return res.status(403).json({ error: 'Unauthorized' });
		}

		// Resume subscription
		const updatedSubscription = await stripe.subscriptions.update(
			subscriptionId,
			{
				pause_collection: null,
			}
		);

		res.json({ subscription: updatedSubscription });
	} catch (error) {
		console.error('Error resuming subscription:', error);
		res.status(500).json({ error: 'Failed to resume subscription' });
	}
});

// Email opt-in endpoint
app.post('/api/email-optin', async (req, res) => {
	try {
		const { email } = req.body;

		if (!email || !email.includes('@')) {
			return res.status(400).json({ error: 'Valid email required' });
		}

		// In a real app, you would:
		// 1. Add to your email marketing service (Mailchimp, Mailgun, etc.)
		// 2. Store in database
		// 3. Send welcome email

		// For now, we'll just log it
		console.log('New email opt-in:', email);

		// You could also create a Stripe customer for future marketing
		const customer = await stripe.customers.create({
			email,
			metadata: {
				source: 'promo_optin',
				optInDate: new Date().toISOString(),
			},
		});

		res.json({
			success: true,
			message: 'Successfully subscribed to promotional emails',
			customerId: customer.id,
		});
	} catch (error) {
		console.error('Error processing email opt-in:', error);
		res.status(500).json({ error: 'Failed to process subscription' });
	}
});

// Customer data management
app.post('/api/customer-data', async (req, res) => {
	// ... existing code ...
});

// Google Places API proxy endpoints
app.get('/api/places/autocomplete', async (req, res) => {
	try {
		const { input } = req.query;

		if (!input || input.length < 3) {
			return res.json({ predictions: [] });
		}

		const apiKey = process.env.GOOGLE_PLACES_API_KEY;
		if (!apiKey) {
			console.error('Google Places API key not configured');
			return res.status(500).json({
				error: 'Google Places API not configured',
			});
		}

		const response = await axios.get(
			'https://maps.googleapis.com/maps/api/place/autocomplete/json',
			{
				params: {
					input,
					key: apiKey,
					types: 'address',
					components: 'country:us',
				},
			}
		);

		res.json(response.data);
	} catch (error) {
		console.error('Google Places Autocomplete error:', error);
		res.status(500).json({
			error: 'Failed to fetch address suggestions',
		});
	}
});

app.get('/api/places/details', async (req, res) => {
	try {
		const { placeId } = req.query;

		if (!placeId) {
			return res.status(400).json({ error: 'Place ID is required' });
		}

		const apiKey = process.env.GOOGLE_PLACES_API_KEY;
		if (!apiKey) {
			console.error('Google Places API key not configured');
			return res.status(500).json({
				error: 'Google Places API not configured',
			});
		}

		const response = await axios.get(
			'https://maps.googleapis.com/maps/api/place/details/json',
			{
				params: {
					place_id: placeId,
					key: apiKey,
					fields: 'address_components,formatted_address',
				},
			}
		);

		res.json(response.data);
	} catch (error) {
		console.error('Google Places Details error:', error);
		res.status(500).json({
			error: 'Failed to fetch place details',
		});
	}
});

// Webhook endpoint for Stripe events
app.post(
	'/webhook',
	express.raw({ type: 'application/json' }),
	async (req, res) => {
		const sig = req.headers['stripe-signature'];
		const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

		let event;

		try {
			event = stripe.webhooks.constructEvent(
				req.body,
				sig,
				webhookSecret
			);
		} catch (err) {
			console.error(
				'Webhook signature verification failed:',
				err.message
			);
			return res.status(400).send(`Webhook Error: ${err.message}`);
		}

		// Handle the event
		switch (event.type) {
			case 'payment_intent.succeeded':
				const paymentIntent = event.data.object;
				console.log('PaymentIntent was successful!', paymentIntent.id);
				// TODO: Fulfill the order
				break;

			case 'subscription.created':
				const subscription = event.data.object;
				console.log('Subscription created:', subscription.id);

				// Send welcome email and trigger postcard campaign
				try {
					const customer = await stripe.customers.retrieve(
						subscription.customer
					);
					const subscriptionDetails = {
						plan: subscription.metadata?.billingCycle || 'Monthly',
						billing:
							subscription.metadata?.billingCycle || 'Monthly',
					};

					// Send welcome email
					await emailService.sendWelcomeEmail(
						customer.email,
						subscriptionDetails
					);

					// Trigger Postcard Mania campaign
					console.log('📬 Triggering postcard campaign for subscription:', subscription.id);
					const pcmResult = await postcardManiaService.handleNewSubscription(
						subscription,
						customer
					);
					
					if (pcmResult.success !== false) {
						console.log('✅ Postcard campaign triggered:', {
							subscriptionId: subscription.id,
							ordersPlaced: pcmResult.totalOrdered || 0
						});
						
						// Store PCM order IDs in subscription metadata for tracking
						if (pcmResult.successful && pcmResult.successful.length > 0) {
							const orderIds = pcmResult.successful.map(o => o.orderId).filter(Boolean);
							if (orderIds.length > 0) {
								await stripe.subscriptions.update(subscription.id, {
									metadata: {
										...subscription.metadata,
										pcm_order_ids: JSON.stringify(orderIds),
										pcm_orders_placed: orderIds.length.toString(),
										pcm_campaign_start: new Date().toISOString()
									}
								});
							}
						}
					} else {
						console.error('❌ Failed to trigger postcard campaign:', pcmResult.error);
					}
				} catch (error) {
					console.error('Error processing subscription.created:', error);
				}
				break;

			case 'subscription.updated':
				const updatedSubscription = event.data.object;
				console.log('Subscription updated:', updatedSubscription.id);
				break;

			case 'subscription.deleted':
				const deletedSubscription = event.data.object;
				console.log('Subscription canceled:', deletedSubscription.id);

				// Send cancellation confirmation and cancel pending postcards
				try {
					const customer = await stripe.customers.retrieve(
						deletedSubscription.customer
					);
					const subscriptionDetails = {
						endsAt: new Date(
							deletedSubscription.current_period_end * 1000
						).toLocaleDateString(),
					};

					// Send cancellation email
					await emailService.sendSubscriptionCancellationEmail(
						customer.email,
						subscriptionDetails
					);

					// Cancel pending Postcard Mania orders
					console.log('📬 Canceling postcard orders for subscription:', deletedSubscription.id);
					const pcmResult = await postcardManiaService.handleSubscriptionCancellation(
						deletedSubscription
					);
					
					if (pcmResult.cancelled && pcmResult.cancelled.length > 0) {
						console.log('✅ Cancelled PCM orders:', pcmResult.cancelled.length);
					}
					if (pcmResult.failed && pcmResult.failed.length > 0) {
						console.warn('⚠️  Failed to cancel some orders:', pcmResult.failed.length);
					}
				} catch (error) {
					console.error('Error processing subscription.deleted:', error);
				}
				break;

			case 'invoice.payment_succeeded':
				const invoice = event.data.object;
				console.log('Invoice payment succeeded:', invoice.id);
				// TODO: Send receipt
				break;

			case 'invoice.payment_failed':
				const failedInvoice = event.data.object;
				console.log('Invoice payment failed:', failedInvoice.id);

				// Send payment failure notification
				try {
					const customer = await stripe.customers.retrieve(
						failedInvoice.customer
					);
					const subscriptionDetails = {
						amount: failedInvoice.amount_due / 100,
						currency: failedInvoice.currency,
					};

					await emailService.sendPaymentFailedEmail(
						customer.email,
						subscriptionDetails
					);
				} catch (emailError) {
					console.error(
						'Error sending payment failed email:',
						emailError
					);
				}
				break;

			default:
				console.log(`Unhandled event type ${event.type}`);
		}

		res.json({ received: true });
	}
);

// Add email test endpoint for development
if (process.env.NODE_ENV !== 'production') {
	app.post('/api/test-email', async (req, res) => {
		try {
			const { email, type = 'test' } = req.body;

			if (!email) {
				return res.status(400).json({ error: 'Email required' });
			}

			let result;
			switch (type) {
				case 'welcome':
					result = await emailService.sendWelcomeEmail(email, {
						plan: 'Monthly',
						billing: 'Monthly',
					});
					break;
				case 'cancellation':
					result =
						await emailService.sendSubscriptionCancellationEmail(
							email,
							{ endsAt: 'End of current period' }
						);
					break;
				case 'payment-failed':
					result = await emailService.sendPaymentFailedEmail(email, {
						amount: 60,
						currency: 'usd',
					});
					break;
				default:
					result = await emailService.sendTestEmail(email);
			}

			res.json({ success: true, result });
		} catch (error) {
			console.error('Test email error:', error);
			res.status(500).json({ error: error.message });
		}
	});

	// ============================================
	// Postcard Mania Test Endpoints (Development Only)
	// ============================================

	// Test PCM connection and authentication
	app.get('/api/pcm/test', async (req, res) => {
		try {
			const result = await postcardManiaService.testConnection();
			res.json(result);
		} catch (error) {
			console.error('PCM test error:', error);
			res.status(500).json({ error: error.message });
		}
	});

	// Get all designs from PCM
	app.get('/api/pcm/designs', async (req, res) => {
		try {
			const designs = await postcardManiaService.getAllDesigns(true);
			res.json({ 
				count: designs.length, 
				designs: designs.map(d => ({
					id: d.id || d.designId,
					name: d.name || d.designName,
					type: d.type
				}))
			});
		} catch (error) {
			console.error('PCM designs error:', error);
			res.status(500).json({ error: error.message });
		}
	});

	// Test placing a postcard order (uses demo mode if not configured)
	app.post('/api/pcm/test-order', async (req, res) => {
		try {
			const { 
				firstName = 'Test',
				lastName = 'User',
				address = '123 Test St',
				city = 'Clearwater',
				state = 'FL',
				zipCode = '33765',
				designId = 1
			} = req.body;

			const result = await postcardManiaService.placePostcardOrder(
				{ firstName, lastName, address, city, state, zipCode },
				designId,
				{ 
					mailDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
					variables: { dayNumber: 1 }
				}
			);

			res.json(result);
		} catch (error) {
			console.error('PCM test order error:', error);
			res.status(500).json({ error: error.message });
		}
	});

	// Verify an address
	app.post('/api/pcm/verify-address', async (req, res) => {
		try {
			const { firstName, lastName, address, address2, city, state, zipCode } = req.body;
			
			const result = await postcardManiaService.verifyRecipient({
				firstName, lastName, address, address2, city, state, zipCode
			});

			res.json(result);
		} catch (error) {
			console.error('PCM address verify error:', error);
			res.status(500).json({ error: error.message });
		}
	});

	// Get retry queue status
	app.get('/api/pcm/retry-queue', async (req, res) => {
		try {
			const status = postcardManiaService.getRetryQueueStatus();
			res.json(status);
		} catch (error) {
			console.error('PCM retry queue error:', error);
			res.status(500).json({ error: error.message });
		}
	});

	// Process retry queue manually
	app.post('/api/pcm/process-retry-queue', async (req, res) => {
		try {
			await postcardManiaService.processRetryQueue();
			const status = postcardManiaService.getRetryQueueStatus();
			res.json({ message: 'Retry queue processed', status });
		} catch (error) {
			console.error('PCM retry queue process error:', error);
			res.status(500).json({ error: error.message });
		}
	});

	// Simulate a full subscription campaign (for testing)
	app.post('/api/pcm/simulate-subscription', async (req, res) => {
		try {
			const {
				email = 'test@example.com',
				firstName = 'Test',
				lastName = 'User',
				address = '123 Test St',
				city = 'Clearwater',
				state = 'FL',
				zipCode = '33765',
				duration = 7 // Default to trial (7 days)
			} = req.body;

			// Create mock subscription and customer objects
			const mockSubscription = {
				id: `test_sub_${Date.now()}`,
				metadata: {
					billingCycle: duration === 7 ? 'trial' : duration === 30 ? 'monthly' : 'quarterly',
					recipientInfo: JSON.stringify({
						firstName, lastName, address, city, state, zipCode
					})
				}
			};

			const mockCustomer = {
				id: `test_cus_${Date.now()}`,
				email,
				shipping: {
					name: `${firstName} ${lastName}`,
					address: {
						line1: address,
						city, state,
						postal_code: zipCode
					}
				}
			};

			const result = await postcardManiaService.handleNewSubscription(
				mockSubscription,
				mockCustomer
			);

			res.json({
				message: 'Simulation complete',
				subscriptionId: mockSubscription.id,
				duration,
				result
			});
		} catch (error) {
			console.error('PCM simulation error:', error);
			res.status(500).json({ error: error.message });
		}
	});
}

// Catch-all handler: send back React's index.html file for any non-API routes
if (process.env.NODE_ENV === 'production') {
	// Serve static files from React build
	app.use(express.static(path.join(__dirname, '../client/build')));

	app.get('*', (req, res) => {
		res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
	});
}

// Start server
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	console.log(
		`Stripe mode: ${
			process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')
				? 'TEST'
				: 'LIVE'
		}`
	);
});
