const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const axios = require('axios');

/**
 * Postcard Mania Integration Service
 *
 * Handles communication with the Postcard Mania DirectMail API v3
 * for automated postcard fulfillment when customers subscribe.
 *
 * Uses Option B: Content Calendar approach
 * - 365 pre-designed postcards (PP-001 through PP-365)
 * - Users enter the "stream" at their subscription day
 * - Each billing cycle triggers a new batch of orders
 *
 * API Documentation: https://docs.pcmintegrations.com/docs/directmail-api/92547af449aa8-direct-mail-api-v3
 */

class PostcardManiaService {
	constructor() {
		// API Configuration
		this.baseUrl = 'https://v3.pcmintegrations.com';
		this.apiKey = process.env.PCM_API_KEY;
		this.apiSecret = process.env.PCM_API_SECRET;
		this.childRefNbr = process.env.PCM_CHILD_REF_NBR || null;

		// Token management
		this.bearerToken = null;
		this.tokenExpires = null;

		// Design naming convention: PP-001 through PP-365
		this.designPrefix = 'PP-';

		// Cached designs (fetched from PCM)
		this.designsCache = null;
		this.designsCacheExpiry = null;

		// Failed orders queue for retry
		this.failedOrdersQueue = [];

		// Configuration check
		this.isConfigured = !!(this.apiKey && this.apiSecret);

		if (!this.isConfigured) {
			console.warn(
				'⚠️  WARNING: Postcard Mania API credentials not configured.'
			);
			console.warn(
				'   Set PCM_API_KEY and PCM_API_SECRET in your .env file.'
			);
			console.warn(
				'   Postcard fulfillment will be disabled until configured.'
			);
		} else {
			console.log('✅ Postcard Mania service initialized');
		}
	}

	// ==========================================
	// AUTHENTICATION
	// ==========================================

	/**
	 * Authenticate with PCM API and get bearer token
	 * Token is cached and refreshed when expired
	 */
	async authenticate() {
		if (!this.isConfigured) {
			throw new Error('Postcard Mania API not configured');
		}

		// Return cached token if still valid (with 5 min buffer)
		if (
			this.bearerToken &&
			this.tokenExpires &&
			Date.now() < this.tokenExpires - 300000
		) {
			return this.bearerToken;
		}

		try {
			const response = await axios.post(
				`${this.baseUrl}/auth/login`,
				{
					apiKey: this.apiKey,
					apiSecret: this.apiSecret,
					...(this.childRefNbr && { childRefNbr: this.childRefNbr }),
				},
				{
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json',
					},
				}
			);

			this.bearerToken = response.data.token;
			this.tokenExpires = new Date(response.data.expires).getTime();

			console.log(
				'✅ PCM authentication successful, token expires:',
				response.data.expires
			);
			return this.bearerToken;
		} catch (error) {
			console.error(
				'❌ PCM authentication failed:',
				error.response?.data || error.message
			);
			throw new Error('Failed to authenticate with Postcard Mania API');
		}
	}

	/**
	 * Make authenticated API request
	 */
	async apiRequest(method, endpoint, data = null) {
		const token = await this.authenticate();

		const config = {
			method,
			url: `${this.baseUrl}${endpoint}`,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
		};

		if (data) {
			config.data = data;
		}

		try {
			const response = await axios(config);
			return response.data;
		} catch (error) {
			console.error(
				`❌ PCM API error [${method} ${endpoint}]:`,
				error.response?.data || error.message
			);
			throw error;
		}
	}

	// ==========================================
	// DESIGN MANAGEMENT
	// ==========================================

	/**
	 * Fetch all designs from PCM account
	 * Results are cached for 1 hour
	 *
	 * API Endpoint: GET https://v3.pcmintegrations.com/design
	 * Documentation: https://docs.pcmintegrations.com/docs/directmail-api/3d3a3000ff275-get-all-designs
	 */
	async getAllDesigns(forceRefresh = false) {
		if (
			!forceRefresh &&
			this.designsCache &&
			this.designsCacheExpiry > Date.now()
		) {
			return this.designsCache;
		}

		if (!this.isConfigured) {
			console.log('📋 [DEMO] Would fetch designs from PCM');
			return [];
		}

		try {
			// Note: endpoint is /design (singular)
			const response = await this.apiRequest('GET', '/design');
			// Response contains results array with pagination
			this.designsCache = response.results || response.data || response;
			this.designsCacheExpiry = Date.now() + 3600000; // Cache for 1 hour

			console.log(
				`📋 Fetched ${this.designsCache.length} designs from PCM`
			);
			return this.designsCache;
		} catch (error) {
			console.error('Failed to fetch designs:', error);
			return this.designsCache || [];
		}
	}

	/**
	 * Get design by day of year (1-365)
	 * Design naming convention: PP-001, PP-002, ..., PP-365
	 */
	async getDesignForDay(dayOfYear) {
		const designs = await this.getAllDesigns();
		const designName = `${this.designPrefix}${String(dayOfYear).padStart(
			3,
			'0'
		)}`;

		const design = designs.find(
			(d) =>
				d.name === designName ||
				d.designName === designName ||
				d.nickname === designName
		);

		if (!design) {
			console.warn(
				`⚠️  Design not found for day ${dayOfYear} (${designName})`
			);
			// Fallback to day 1 if specific design not found
			return designs.find(
				(d) =>
					d.name?.startsWith(this.designPrefix) ||
					d.designName?.startsWith(this.designPrefix)
			);
		}

		return design;
	}

	/**
	 * Get design ID by day number
	 */
	async getDesignIdForDay(dayOfYear) {
		const design = await this.getDesignForDay(dayOfYear);
		return design?.id || design?.designId || null;
	}

	// ==========================================
	// ORDER PLACEMENT
	// ==========================================

	/**
	 * Place a single postcard order for a recipient
	 *
	 * API Endpoint: POST https://v3.pcmintegrations.com/order/postcard
	 * Documentation: https://docs.pcmintegrations.com/docs/directmail-api/24b58db675dad-place-postcard-order
	 *
	 * @param {Object} recipient - Recipient address info
	 * @param {number} designId - PCM design ID to use
	 * @param {Object} options - Additional options (mailDate, variables, etc.)
	 */
	async placePostcardOrder(recipient, designId, options = {}) {
		if (!this.isConfigured) {
			console.log('📮 [DEMO] Would place postcard order:', {
				recipient: `${recipient.firstName} ${recipient.lastName}`,
				designId,
				...options,
			});
			return { demo: true, orderId: `demo-${Date.now()}` };
		}

		// Build the order request based on PCM API format
		// See: https://docs.pcmintegrations.com/docs/directmail-api/24b58db675dad-place-postcard-order
		const orderRequest = {
			// Mail class: "FirstClass" or "Standard"
			mailClass: options.mailClass || 'FirstClass',

			// Postcard size: "46" (4x6), "68" (6x8), "69" (6x9), "611" (6x11)
			size: options.size || '46',

			// Design ID from PCM dashboard
			designID: parseInt(designId, 10),

			// Recipients array
			recipients: [
				{
					firstName: recipient.firstName || '',
					lastName: recipient.lastName || '',
					company: recipient.company || '',
					address:
						recipient.address ||
						recipient.address1 ||
						recipient.line1,
					address2: recipient.address2 || recipient.line2 || '',
					city: recipient.city,
					state: recipient.state,
					zipCode:
						recipient.zipCode ||
						recipient.zip ||
						recipient.postalCode,
					// External reference for tracking
					extRefNbr: options.extRefNbr || null,
					// Dynamic variables for personalization
					variables: options.variables
						? Object.entries(options.variables).map(
								([key, value]) => ({
									key,
									value: String(value),
								})
						  )
						: [],
				},
			],

			// Return address (your business address)
			returnAddress: {
				company: process.env.PCM_RETURN_COMPANY || 'Positive Postcards',
				firstName: process.env.PCM_RETURN_FIRST_NAME || '',
				lastName: process.env.PCM_RETURN_LAST_NAME || '',
				address: process.env.PCM_RETURN_ADDRESS || '123 Main St',
				address2: process.env.PCM_RETURN_ADDRESS2 || '',
				city: process.env.PCM_RETURN_CITY || 'Clearwater',
				state: process.env.PCM_RETURN_STATE || 'FL',
				zipCode: process.env.PCM_RETURN_ZIP || '33765',
			},

			// Mail date (YYYY-MM-DD format)
			...(options.mailDate && { mailDate: options.mailDate }),

			// External reference number for the order
			...(options.orderRefNbr && { extRefNbr: options.orderRefNbr }),

			// Optional: addressing customization
			addressing: options.addressing || {
				font: 'Bradley Hand',
				fontColor: 'Black',
				exceptionalAddressingType: 'resident',
			},
		};

		try {
			// Note: endpoint is /order/postcard (singular), not /orders/postcard
			const response = await this.apiRequest(
				'POST',
				'/order/postcard',
				orderRequest
			);

			console.log(`📮 Postcard order placed successfully:`, {
				orderId: response.orderId || response.id,
				recipient: `${recipient.firstName} ${recipient.lastName}`,
				designId,
			});

			return {
				success: true,
				orderId: response.orderId || response.id,
				batchId: response.batchId,
				status: response.status,
				response,
			};
		} catch (error) {
			console.error(
				'❌ Failed to place postcard order:',
				error.response?.data || error.message
			);

			// Add to retry queue
			this.addToFailedQueue({
				recipient,
				designId,
				options,
				error: error.message,
				timestamp: Date.now(),
			});

			throw error;
		}
	}

	/**
	 * Place multiple postcard orders for a subscription period
	 *
	 * @param {Object} recipient - Customer shipping address
	 * @param {number} startDay - Starting day of year (1-365)
	 * @param {number} duration - Number of postcards to schedule (7, 30, 90, or 365)
	 * @param {string} subscriptionId - Stripe subscription ID for tracking
	 */
	async placeSubscriptionOrders(
		recipient,
		startDay,
		duration,
		subscriptionId
	) {
		const results = {
			successful: [],
			failed: [],
			totalOrdered: 0,
			subscriptionId,
		};

		console.log(
			`📬 Placing ${duration} postcard orders starting from day ${startDay}`
		);

		for (let i = 0; i < duration; i++) {
			// Calculate day of year (wraps around after 365)
			const dayOfYear = ((startDay - 1 + i) % 365) + 1;

			// Calculate mail date (i days from now)
			const mailDate = new Date();
			mailDate.setDate(mailDate.getDate() + i);
			const mailDateStr = mailDate.toISOString().split('T')[0]; // YYYY-MM-DD

			try {
				const designId = await this.getDesignIdForDay(dayOfYear);

				if (!designId) {
					console.warn(
						`⚠️  Skipping day ${dayOfYear} - no design found`
					);
					results.failed.push({
						day: dayOfYear,
						error: 'Design not found',
					});
					continue;
				}

				const order = await this.placePostcardOrder(
					recipient,
					designId,
					{
						mailDate: mailDateStr,
						variables: {
							dayNumber: dayOfYear,
							subscriptionId,
						},
					}
				);

				results.successful.push({
					day: dayOfYear,
					orderId: order.orderId,
					mailDate: mailDateStr,
				});
				results.totalOrdered++;
			} catch (error) {
				results.failed.push({
					day: dayOfYear,
					error: error.message,
					mailDate: mailDateStr,
				});
			}

			// Rate limiting - avoid overwhelming the API
			await this.sleep(100);
		}

		console.log(
			`📬 Subscription orders complete: ${results.totalOrdered} placed, ${results.failed.length} failed`
		);
		return results;
	}

	// ==========================================
	// ORDER MANAGEMENT
	// ==========================================

	/**
	 * Get order status by ID
	 *
	 * API Endpoint: GET https://v3.pcmintegrations.com/order/{orderId}
	 */
	async getOrder(orderId) {
		if (!this.isConfigured) {
			return { demo: true, orderId, status: 'demo' };
		}

		return await this.apiRequest('GET', `/order/${orderId}`);
	}

	/**
	 * Cancel an order
	 *
	 * API Endpoint: DELETE https://v3.pcmintegrations.com/order/{orderId}
	 * Documentation: https://docs.pcmintegrations.com/docs/directmail-api/iuc7kuzptpgwv-cancel-order
	 */
	async cancelOrder(orderId) {
		if (!this.isConfigured) {
			console.log(`📮 [DEMO] Would cancel order: ${orderId}`);
			return { demo: true, orderId, cancelled: true };
		}

		try {
			const response = await this.apiRequest(
				'DELETE',
				`/order/${orderId}`
			);
			console.log(`📮 Order ${orderId} cancelled successfully`);
			return { success: true, orderId, response };
		} catch (error) {
			console.error(
				`❌ Failed to cancel order ${orderId}:`,
				error.message
			);
			throw error;
		}
	}

	/**
	 * Bulk cancel orders for a subscription
	 * Used when a customer cancels their subscription
	 */
	async cancelSubscriptionOrders(orderIds) {
		const results = {
			cancelled: [],
			failed: [],
		};

		for (const orderId of orderIds) {
			try {
				await this.cancelOrder(orderId);
				results.cancelled.push(orderId);
			} catch (error) {
				results.failed.push({ orderId, error: error.message });
			}
			await this.sleep(100);
		}

		console.log(
			`📮 Cancelled ${results.cancelled.length}/${orderIds.length} orders`
		);
		return results;
	}

	/**
	 * Get all orders for tracking
	 *
	 * API Endpoint: GET https://v3.pcmintegrations.com/order
	 */
	async getAllOrders(page = 1, limit = 50) {
		if (!this.isConfigured) {
			return { demo: true, orders: [] };
		}

		return await this.apiRequest(
			'GET',
			`/order?page=${page}&perPage=${limit}`
		);
	}

	/**
	 * Get order recipients (for tracking individual postcards)
	 *
	 * API Endpoint: GET https://v3.pcmintegrations.com/order/{orderId}/recipients
	 * Documentation: https://docs.pcmintegrations.com/docs/directmail-api/d4d3022bcf3a8-get-order-recipients
	 */
	async getOrderRecipients(orderId, page = 1, perPage = 50) {
		if (!this.isConfigured) {
			return { demo: true, results: [] };
		}

		return await this.apiRequest(
			'GET',
			`/order/${orderId}/recipients?page=${page}&perPage=${perPage}`
		);
	}

	// ==========================================
	// RECIPIENT VALIDATION
	// ==========================================

	/**
	 * Verify recipient address is deliverable
	 *
	 * API Endpoint: POST https://v3.pcmintegrations.com/recipient/verify
	 * Documentation: https://docs.pcmintegrations.com/docs/directmail-api/k49y925eo4waw-verify-recipients
	 */
	async verifyRecipient(recipient) {
		if (!this.isConfigured) {
			return { demo: true, valid: true };
		}

		try {
			const response = await this.apiRequest(
				'POST',
				'/recipient/verify',
				{
					recipients: [
						{
							firstName: recipient.firstName || '',
							lastName: recipient.lastName || '',
							company: recipient.company || '',
							address:
								recipient.address ||
								recipient.address1 ||
								recipient.line1,
							address2:
								recipient.address2 || recipient.line2 || '',
							city: recipient.city,
							state: recipient.state,
							zipCode:
								recipient.zipCode ||
								recipient.zip ||
								recipient.postalCode,
						},
					],
				}
			);

			// Check if the address is deliverable
			const result = response.results?.[0] || response;
			return {
				valid: !result.undeliverable,
				undeliverableReason: result.undeliverableReason,
				standardized: result,
				response,
			};
		} catch (error) {
			console.error('Address verification failed:', error.message);
			return { valid: false, error: error.message };
		}
	}

	// ==========================================
	// SUBSCRIPTION LIFECYCLE HANDLERS
	// ==========================================

	/**
	 * Handle new subscription - trigger postcard campaign
	 * Called from Stripe webhook: subscription.created
	 * 
	 * Stores metadata for continuation on renewal:
	 * - pcm_start_day: The day of year when subscription started
	 * - pcm_last_day: The last day of year processed (for continuation)
	 * - pcm_order_ids: JSON array of PCM order IDs
	 * - pcm_orders_placed: Total orders placed
	 */
	async handleNewSubscription(stripeSubscription, stripeCustomer) {
		console.log(
			`\n📬 Processing new subscription: ${stripeSubscription.id}`
		);

		// Extract shipping address from customer metadata or subscription metadata
		const recipientInfo = this.extractRecipientInfo(
			stripeSubscription,
			stripeCustomer
		);

		if (!recipientInfo) {
			console.error('❌ No shipping address found for subscription');
			await this.notifyAdmin('Missing shipping address', {
				subscriptionId: stripeSubscription.id,
				customerId: stripeCustomer.id,
			});
			return { success: false, error: 'No shipping address' };
		}

		// Determine subscription duration based on billing cycle
		const duration = this.getDurationFromSubscription(stripeSubscription);

		// Calculate starting day of year
		const startDay = this.getDayOfYear(new Date());
		
		// Calculate the last day that will be processed
		const lastDay = ((startDay - 1 + duration - 1) % 365) + 1;

		// Verify address before placing orders
		const verification = await this.verifyRecipient(recipientInfo);
		if (!verification.valid && !verification.demo) {
			console.warn('⚠️  Address verification failed, proceeding anyway');
			await this.notifyAdmin('Address verification failed', {
				subscriptionId: stripeSubscription.id,
				address: recipientInfo,
				error: verification.error,
			});
		}

		// Place postcard orders
		try {
			const results = await this.placeSubscriptionOrders(
				recipientInfo,
				startDay,
				duration,
				stripeSubscription.id
			);

			// Add metadata for tracking and renewal continuation
			results.metadata = {
				pcm_start_day: startDay.toString(),
				pcm_last_day: lastDay.toString(),
				pcm_campaign_start: new Date().toISOString(),
				pcm_duration: duration.toString(),
			};

			console.log(`✅ Subscription ${stripeSubscription.id} processed:`, {
				ordersPlaced: results.totalOrdered,
				ordersFailed: results.failed.length,
				startDay,
				lastDay,
			});

			// Notify admin of any failures
			if (results.failed.length > 0) {
				await this.notifyAdmin('Some postcard orders failed', {
					subscriptionId: stripeSubscription.id,
					failures: results.failed,
				});
			}

			return results;
		} catch (error) {
			console.error('❌ Failed to process subscription:', error);
			await this.notifyAdmin('Subscription processing failed', {
				subscriptionId: stripeSubscription.id,
				error: error.message,
			});
			return { success: false, error: error.message };
		}
	}

	/**
	 * Handle subscription renewal - trigger next billing period postcards
	 * Called from Stripe webhook: invoice.payment_succeeded
	 * 
	 * Continues from where the previous billing period left off in the calendar.
	 * Uses pcm_last_day from subscription metadata to determine starting point.
	 */
	async handleSubscriptionRenewal(invoice, stripeSubscription, stripeCustomer) {
		// Only process subscription invoices (not one-time payments)
		if (!invoice.subscription) {
			return null;
		}

		// Skip if this is the first invoice (handled by subscription.created)
		if (invoice.billing_reason === 'subscription_create') {
			console.log('📬 Skipping renewal - this is the initial subscription invoice');
			return { success: true, skipped: true, reason: 'initial_invoice' };
		}

		console.log(
			`\n📬 Processing subscription renewal: ${invoice.subscription}`
		);

		// Extract shipping address
		const recipientInfo = this.extractRecipientInfo(
			stripeSubscription,
			stripeCustomer
		);

		if (!recipientInfo) {
			console.error('❌ No shipping address found for renewal');
			await this.notifyAdmin('Missing shipping address on renewal', {
				subscriptionId: stripeSubscription.id,
				invoiceId: invoice.id,
			});
			return { success: false, error: 'No shipping address' };
		}

		// Determine subscription duration based on billing cycle
		const duration = this.getDurationFromSubscription(stripeSubscription);

		// Get the last processed day from metadata (continue where we left off)
		const lastProcessedDay = parseInt(stripeSubscription.metadata?.pcm_last_day, 10);
		
		// Calculate starting day: day after the last processed day (wraps around)
		let startDay;
		if (lastProcessedDay && !isNaN(lastProcessedDay)) {
			// Continue from where we left off
			startDay = (lastProcessedDay % 365) + 1;
			console.log(`📅 Continuing from day ${startDay} (last processed: ${lastProcessedDay})`);
		} else {
			// Fallback to current day if no metadata
			startDay = this.getDayOfYear(new Date());
			console.log(`📅 No previous day found, starting from current day: ${startDay}`);
		}

		// Calculate the new last day
		const newLastDay = ((startDay - 1 + duration - 1) % 365) + 1;

		// Place postcard orders for the renewal period
		try {
			const results = await this.placeSubscriptionOrders(
				recipientInfo,
				startDay,
				duration,
				stripeSubscription.id
			);

			// Add metadata for tracking the new period
			results.metadata = {
				pcm_last_day: newLastDay.toString(),
				pcm_renewal_date: new Date().toISOString(),
				pcm_renewal_start_day: startDay.toString(),
			};

			console.log(`✅ Subscription renewal ${stripeSubscription.id} processed:`, {
				ordersPlaced: results.totalOrdered,
				ordersFailed: results.failed.length,
				startDay,
				newLastDay,
				continuedFrom: lastProcessedDay || 'none',
			});

			// Notify admin of any failures
			if (results.failed.length > 0) {
				await this.notifyAdmin('Some renewal postcard orders failed', {
					subscriptionId: stripeSubscription.id,
					invoiceId: invoice.id,
					failures: results.failed,
				});
			}

			return results;
		} catch (error) {
			console.error('❌ Failed to process subscription renewal:', error);
			await this.notifyAdmin('Subscription renewal processing failed', {
				subscriptionId: stripeSubscription.id,
				invoiceId: invoice.id,
				error: error.message,
			});
			return { success: false, error: error.message };
		}
	}

	/**
	 * Handle subscription cancellation - cancel pending postcards
	 * Called from Stripe webhook: subscription.deleted
	 */
	async handleSubscriptionCancellation(stripeSubscription) {
		console.log(
			`\n📬 Processing subscription cancellation: ${stripeSubscription.id}`
		);

		// Get order IDs from subscription metadata
		const orderIds = stripeSubscription.metadata?.pcm_order_ids;

		if (!orderIds) {
			console.log('No PCM orders to cancel for this subscription');
			return { success: true, message: 'No orders to cancel' };
		}

		const orderIdList = JSON.parse(orderIds);
		const results = await this.cancelSubscriptionOrders(orderIdList);

		return results;
	}

	// ==========================================
	// UTILITY FUNCTIONS
	// ==========================================

	/**
	 * Extract recipient info from Stripe subscription/customer
	 */
	extractRecipientInfo(subscription, customer) {
		// Check subscription metadata first (for gift subscriptions)
		if (subscription.metadata?.recipientInfo) {
			try {
				return JSON.parse(subscription.metadata.recipientInfo);
			} catch (e) {
				console.error('Failed to parse recipient info from metadata');
			}
		}

		// Check customer shipping address
		if (customer.shipping?.address) {
			return {
				firstName:
					customer.shipping.name?.split(' ')[0] ||
					customer.name?.split(' ')[0] ||
					'',
				lastName:
					customer.shipping.name?.split(' ').slice(1).join(' ') ||
					customer.name?.split(' ').slice(1).join(' ') ||
					'',
				address1: customer.shipping.address.line1,
				address2: customer.shipping.address.line2 || '',
				city: customer.shipping.address.city,
				state: customer.shipping.address.state,
				zip: customer.shipping.address.postal_code,
			};
		}

		// Check customer address
		if (customer.address) {
			return {
				firstName: customer.name?.split(' ')[0] || '',
				lastName: customer.name?.split(' ').slice(1).join(' ') || '',
				address1: customer.address.line1,
				address2: customer.address.line2 || '',
				city: customer.address.city,
				state: customer.address.state,
				zip: customer.address.postal_code,
			};
		}

		return null;
	}

	/**
	 * Get subscription duration in days based on billing cycle
	 */
	getDurationFromSubscription(subscription) {
		const billingCycle = subscription.metadata?.billingCycle;
		const interval =
			subscription.items?.data[0]?.price?.recurring?.interval;
		const intervalCount =
			subscription.items?.data[0]?.price?.recurring?.interval_count || 1;

		// Check for trial
		if (subscription.metadata?.type === 'trial' || subscription.trial_end) {
			return 7; // 7-day trial
		}

		// Check billing cycle metadata
		switch (billingCycle?.toLowerCase()) {
			case 'monthly':
				return 30;
			case 'quarterly':
				return 90;
			case 'annual':
			case 'yearly':
				return 365;
		}

		// Fallback to interval
		switch (interval) {
			case 'day':
				return intervalCount;
			case 'week':
				return intervalCount * 7;
			case 'month':
				return intervalCount * 30;
			case 'year':
				return 365;
			default:
				return 30; // Default to monthly
		}
	}

	/**
	 * Get day of year (1-365)
	 */
	getDayOfYear(date = new Date()) {
		const start = new Date(date.getFullYear(), 0, 0);
		const diff = date - start;
		const oneDay = 1000 * 60 * 60 * 24;
		return Math.floor(diff / oneDay);
	}

	/**
	 * Sleep utility for rate limiting
	 */
	sleep(ms) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	// ==========================================
	// ERROR HANDLING & NOTIFICATIONS
	// ==========================================

	/**
	 * Add failed order to retry queue
	 */
	addToFailedQueue(failedOrder) {
		this.failedOrdersQueue.push({
			...failedOrder,
			retryCount: 0,
			maxRetries: 3,
		});

		console.log(
			`📋 Added to retry queue. Queue size: ${this.failedOrdersQueue.length}`
		);
	}

	/**
	 * Process retry queue (call periodically)
	 */
	async processRetryQueue() {
		const toRetry = [...this.failedOrdersQueue];
		this.failedOrdersQueue = [];

		console.log(
			`📋 Processing ${toRetry.length} failed orders from retry queue`
		);

		for (const item of toRetry) {
			if (item.retryCount >= item.maxRetries) {
				console.log(
					`❌ Max retries reached for order, notifying admin`
				);
				await this.notifyAdmin('Order permanently failed', item);
				continue;
			}

			try {
				await this.placePostcardOrder(
					item.recipient,
					item.designId,
					item.options
				);
				console.log(`✅ Retry successful for order`);
			} catch (error) {
				item.retryCount++;
				item.lastError = error.message;
				this.failedOrdersQueue.push(item);
			}

			await this.sleep(1000); // Longer delay for retries
		}
	}

	/**
	 * Notify admin of issues
	 */
	async notifyAdmin(subject, details) {
		console.error(`\n🚨 ADMIN NOTIFICATION: ${subject}`, details);

		// TODO: Implement actual notification
		// Options:
		// 1. Send email via Postmark (already integrated)
		// 2. Send Slack notification
		// 3. Log to error tracking service (Sentry, etc.)

		// For now, just log it
		// In production, you'd want to send an email:
		// await emailService.sendAdminAlert(subject, details);
	}

	/**
	 * Get retry queue status
	 */
	getRetryQueueStatus() {
		return {
			queueSize: this.failedOrdersQueue.length,
			items: this.failedOrdersQueue.map((item) => ({
				recipient: `${item.recipient?.firstName} ${item.recipient?.lastName}`,
				retryCount: item.retryCount,
				error: item.error,
				timestamp: item.timestamp,
			})),
		};
	}

	// ==========================================
	// TESTING ENDPOINTS
	// ==========================================

	/**
	 * Test API connection and authentication
	 */
	async testConnection() {
		if (!this.isConfigured) {
			return {
				configured: false,
				message: 'API credentials not configured',
			};
		}

		try {
			await this.authenticate();
			const designs = await this.getAllDesigns();

			return {
				configured: true,
				authenticated: true,
				designCount: designs.length,
				tokenExpires: this.tokenExpires,
			};
		} catch (error) {
			return {
				configured: true,
				authenticated: false,
				error: error.message,
			};
		}
	}
}

// Export singleton instance
module.exports = new PostcardManiaService();
