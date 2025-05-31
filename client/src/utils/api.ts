const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Helper function for API requests
async function apiRequest(endpoint: string, options: RequestInit = {}) {
	const response = await fetch(`${API_URL}${endpoint}`, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			...options.headers,
		},
	});

	if (!response.ok) {
		const error = await response.json();
		throw new Error(error.error || 'API request failed');
	}

	return response.json();
}

// Payment API functions
export const paymentAPI = {
	// Create a payment intent for one-time payments
	createPaymentIntent: async (amount: number, metadata?: any) => {
		return apiRequest('/api/create-payment-intent', {
			method: 'POST',
			body: JSON.stringify({ amount, metadata }),
		});
	},

	// Create a subscription
	createSubscription: async (data: {
		email: string;
		paymentMethodId: string;
		priceId: string;
		billingCycle: string;
		isGift?: boolean;
		recipientInfo?: any;
		businessInfo?: any;
		metadata?: any;
	}) => {
		return apiRequest('/api/create-subscription', {
			method: 'POST',
			body: JSON.stringify(data),
		});
	},

	// Get available prices
	getPrices: async () => {
		return apiRequest('/api/prices');
	},

	// Cancel a subscription
	cancelSubscription: async (subscriptionId: string) => {
		return apiRequest('/api/cancel-subscription', {
			method: 'POST',
			body: JSON.stringify({ subscriptionId }),
		});
	},
};

// Health check
export const checkServerHealth = async () => {
	return apiRequest('/health');
};
