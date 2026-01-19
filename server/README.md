# Positive Postcards Backend Server

Express.js backend server handling payments, authentication, email notifications, and postcard fulfillment for Positive Postcards.

## Features

- **Payment Processing** - Stripe integration for one-time payments and subscriptions
- **Magic Link Authentication** - Passwordless email-based login
- **Subscription Management** - Create, pause, resume, upgrade, downgrade, cancel
- **Customer Dashboard API** - Subscription data and billing portal access
- **Email Service** - Postmark integration for transactional emails
- **Postcard Fulfillment** - Postcard Mania API for automated mailing
- **Address Autocomplete** - Google Places API proxy (secure server-side)
- **Webhook Processing** - Stripe event handling for subscription lifecycle

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Payments**: Stripe
- **Email**: Postmark
- **Fulfillment**: Postcard Mania DirectMail API v3
- **HTTP Client**: Axios

## Project Structure

```
server/
├── server.js               # Main application entry point
├── config/
│   └── stripePrices.js     # Stripe product/price IDs
├── services/
│   ├── emailService.js     # Postmark email service
│   └── postcardManiaService.js  # PCM fulfillment service
├── scripts/
│   └── setupStripeProducts.js   # One-time Stripe setup
├── package.json
└── README.md
```

## API Endpoints

### Health Check

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Server status and Stripe mode (test/live) |

### Authentication

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/auth/send-magic-link` | POST | No | Send login email with magic link |
| `/api/auth/verify` | GET | No | Verify magic link token, create session |

### Payments

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/create-payment-intent` | POST | No | Create one-time payment intent |
| `/api/create-subscription` | POST | No | Create new subscription |
| `/api/prices` | GET | No | Get available product prices |
| `/api/cancel-subscription` | POST | No | Cancel subscription (end of period) |
| `/api/create-portal-session` | POST | Yes | Create Stripe billing portal session |

### Subscription Management

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/dashboard` | GET | Yes | Get customer subscriptions |
| `/api/subscription/current` | GET | Yes | Get active subscription details |
| `/api/subscription/plans` | GET | Yes | Get available upgrade/downgrade plans |
| `/api/subscription/change-plan` | POST | Yes | Upgrade or downgrade subscription |
| `/api/subscription/preview-change` | POST | Yes | Preview proration for plan change |
| `/api/subscription/pause` | POST | Yes | Pause subscription |
| `/api/subscription/resume` | POST | Yes | Resume paused subscription |
| `/api/subscription/reactivate` | POST | Yes | Reactivate cancelled subscription |

### Google Places (Proxied)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/places/autocomplete` | GET | Address suggestions |
| `/api/places/details` | GET | Place details by ID |

### Marketing

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/email-optin` | POST | Subscribe to promotional emails |

### Webhooks

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/webhook` | POST | Stripe webhook handler |

**Handled Webhook Events:**
- `payment_intent.succeeded` - Payment completed
- `subscription.created` - New subscription (triggers welcome email + PCM campaign)
- `subscription.updated` - Subscription changed
- `subscription.deleted` - Subscription cancelled (triggers cancellation email + PCM cancellation)
- `invoice.payment_succeeded` - Renewal payment (triggers next PCM batch)
- `invoice.payment_failed` - Payment failed (triggers notification email)

### Development/Testing Only

These endpoints are only available when `NODE_ENV !== 'production'`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/test-email` | POST | Send test emails |
| `/api/pcm/test` | GET | Test PCM API connection |
| `/api/pcm/designs` | GET | List all PCM designs |
| `/api/pcm/test-order` | POST | Place test postcard order |
| `/api/pcm/verify-address` | POST | Verify recipient address |
| `/api/pcm/retry-queue` | GET | View failed orders queue |
| `/api/pcm/process-retry-queue` | POST | Process retry queue |
| `/api/pcm/simulate-subscription` | POST | Simulate full subscription campaign |

## Setup

### Prerequisites

- Node.js 18+
- Stripe account with API keys
- Postmark account (for emails)
- Google Cloud account with Places API enabled
- Postcard Mania account (for fulfillment)

### Installation

1. **Install dependencies**
   ```bash
   cd server
   npm install
   ```

2. **Configure environment variables**
   
   Create a `.env` file in the project root (parent directory):
   ```bash
   # Stripe (Required)
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...

   # Google Places (Required for address autocomplete)
   GOOGLE_PLACES_API_KEY=AIza...

   # Postmark (Required for emails)
   POSTMARK_API_KEY=your_api_key
   POSTMARK_SERVER_ID=your_server_id
   EMAIL_FROM=noreply@positivepostcards.com

   # Postcard Mania (Required for fulfillment)
   PCM_API_KEY=your_api_key
   PCM_API_SECRET=your_api_secret
   PCM_RETURN_COMPANY=Positive Postcards
   PCM_RETURN_ADDRESS=123 Main Street
   PCM_RETURN_CITY=Clearwater
   PCM_RETURN_STATE=FL
   PCM_RETURN_ZIP=33765

   # Application
   NODE_ENV=development
   PORT=3001
   ```

3. **Set up Stripe products** (one-time)
   ```bash
   node scripts/setupStripeProducts.js
   ```

4. **Run the server**
   ```bash
   npm run dev   # Development with nodemon
   npm start     # Production
   ```

## Authentication

The server uses a simple session-based authentication system:

1. User requests magic link via `/api/auth/send-magic-link`
2. Server generates token, stores in memory, sends email via Postmark
3. User clicks link, token verified via `/api/auth/verify`
4. Server returns session token (valid 7 days)
5. Client includes session token in `Authorization: Bearer <token>` header

**Note:** Sessions are stored in-memory. For production, use Redis or a database.

## Services

### Email Service (`services/emailService.js`)

Handles all transactional emails via Postmark:

- **Magic Link** - Login authentication emails
- **Welcome** - New subscription confirmation
- **Cancellation** - Subscription cancelled notification
- **Payment Failed** - Payment issue notification

Falls back to console logging if Postmark is not configured.

### Postcard Mania Service (`services/postcardManiaService.js`)

Handles physical postcard fulfillment:

- **Content Calendar** - 365 designs (PP-001 to PP-365)
- **Order Placement** - Schedule postcards for mailing
- **Address Verification** - Validate recipient addresses
- **Order Cancellation** - Cancel pending orders
- **Retry Queue** - Automatic retry for failed orders

See [README_PCM_INTEGRATION.md](../markdown/README_PCM_INTEGRATION.md) for detailed documentation.

## Stripe Configuration

### Price IDs

Price IDs are configured in `config/stripePrices.js`:

```javascript
// Individual subscriptions
individual_monthly: $120/month
individual_quarterly: $198/quarter
individual_annual: $720/year

// Promotional
promo_trial_7days: $7 for 7 days
promo_first_month_half: $60 (50% off)
promo_downsell_monthly: $90 (25% off)

// Business
business_starter: $90/person/month
business_growth: $80/person/month
```

### Webhook Setup

1. Go to Stripe Dashboard > Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/webhook`
3. Select events:
   - `payment_intent.succeeded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy signing secret to `STRIPE_WEBHOOK_SECRET`

## CORS Configuration

CORS is configured based on environment:

- **Development**: `http://localhost:3000`
- **Production**: `https://www.positivepost.cards`

## Testing

### Test Endpoints

```bash
# Health check
curl http://localhost:3001/health

# Test email
curl -X POST http://localhost:3001/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","type":"welcome"}'

# Test PCM connection
curl http://localhost:3001/api/pcm/test

# Simulate subscription
curl -X POST http://localhost:3001/api/pcm/simulate-subscription \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","firstName":"Test","lastName":"User","duration":7}'
```

### Stripe Test Cards

| Card | Result |
|------|--------|
| `4242 4242 4242 4242` | Success |
| `4000 0025 0000 3155` | Requires authentication |
| `4000 0000 0000 9995` | Declined |

### Local Webhook Testing

Use Stripe CLI to forward webhooks locally:

```bash
stripe listen --forward-to localhost:3001/webhook
```

## Production Deployment

### Environment Variables

Set these in your hosting platform (Render, etc.):

```bash
NODE_ENV=production
PORT=10000
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
GOOGLE_PLACES_API_KEY=AIza...
POSTMARK_API_KEY=...
POSTMARK_SERVER_ID=...
EMAIL_FROM=noreply@positivepostcards.com
PCM_API_KEY=...
PCM_API_SECRET=...
PCM_RETURN_COMPANY=...
PCM_RETURN_ADDRESS=...
PCM_RETURN_CITY=...
PCM_RETURN_STATE=...
PCM_RETURN_ZIP=...
```

### Production Checklist

- [ ] Use production Stripe keys (not test keys)
- [ ] Configure webhook endpoint in Stripe dashboard
- [ ] Verify Postmark sender domain
- [ ] Use production PCM API keys
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS
- [ ] Configure proper CORS origin
- [ ] Set up monitoring and logging
- [ ] Implement Redis for session storage

## Security

- **API Keys** - All sensitive keys are server-side only
- **Google Places** - Proxied to hide API key from client
- **Webhooks** - Signature verification prevents tampering
- **Sessions** - Token-based authentication with expiration
- **CORS** - Restricted to specific origins

See [SECURITY.md](../markdown/SECURITY.md) for full security documentation.

## Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start with nodemon (auto-reload) |

## Troubleshooting

### "STRIPE_SECRET_KEY is not set"
Ensure `.env` file exists in the project root with valid Stripe key.

### "Google Places API not configured"
Set `GOOGLE_PLACES_API_KEY` in environment variables.

### "Postmark API key not configured"
Email service runs in demo mode, logging to console instead of sending.

### "PCM API credentials not configured"
Postcard fulfillment runs in demo mode, logging orders to console.

### Webhook signature verification failed
- Check `STRIPE_WEBHOOK_SECRET` matches Stripe dashboard
- Ensure raw body is used for webhook endpoint (not parsed JSON)

## Dependencies

```json
{
  "axios": "^1.9.0",
  "body-parser": "^1.20.2",
  "cors": "^2.8.5",
  "dotenv": "^16.3.1",
  "express": "^4.18.2",
  "postmark": "^4.0.5",
  "stripe": "^14.0.0"
}
```

## License

© 2026 Positive Postcards. All rights reserved.
