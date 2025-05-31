# Positive Postcards Backend Server

This Express server handles payment processing for Positive Postcards using Stripe.

## Features

- **Payment Processing**: Secure payment intent creation for one-time payments
- **Subscription Management**: Create and manage recurring subscriptions
- **Customer Management**: Automatically create/retrieve Stripe customers
- **Webhook Handling**: Process Stripe events for payment updates
- **Price Management**: Automatically create products and prices in Stripe

## API Endpoints

### Health Check
- `GET /health` - Check server status and Stripe mode (test/live)

### Payment Endpoints
- `POST /api/create-payment-intent` - Create a payment intent for one-time payments
- `POST /api/create-subscription` - Create a new subscription
- `GET /api/prices` - Get available subscription prices
- `POST /api/cancel-subscription` - Cancel an existing subscription

### Webhook
- `POST /webhook` - Handle Stripe webhook events

## Setup

1. Ensure you have the `.env` file in the parent directory with:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_... (optional, for webhooks)
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the server:
   ```bash
   npm run dev   # Development with auto-reload
   npm start     # Production
   ```

## Security Notes

- The server uses CORS to only accept requests from `http://localhost:3000`
- Never expose the secret key in frontend code
- Always validate webhook signatures in production
- Use HTTPS in production

## Testing

The server is configured with test keys by default. You'll see "TEST" mode in:
- Server startup logs
- Health check endpoint
- Stripe dashboard test data

## Production Checklist

- [ ] Update CORS origin to production domain
- [ ] Set up webhook endpoint in Stripe dashboard
- [ ] Add webhook secret to environment variables
- [ ] Switch to live API keys
- [ ] Enable HTTPS
- [ ] Set up proper logging and monitoring 