# Positive Postcards - E-commerce Platform

Transform your mindset with daily affirmation postcards delivered to your door. A full-stack e-commerce platform for a subscription service that delivers beautiful, meaningful mail that creates lasting positive change.

**Live Site:** [www.positivepost.cards](https://www.positivepost.cards)

## Features

### Core E-commerce
- Beautiful, responsive React landing page with modern UI
- Full shopping cart with localStorage persistence
- Secure checkout with Stripe payment processing
- Address autocomplete via Google Places API (server-proxied for security)
- Subscription and one-time purchase options
- Business/bulk ordering for companies

### Customer Experience
- **Magic Link Authentication** - passwordless login via secure email links
- **Customer Dashboard** - subscription management interface
- **Subscription Controls** - pause, resume, upgrade, downgrade, cancel
- **Stripe Billing Portal** - update payment methods, view invoices
- **Upsell/Downsell Flow** - promotional offers and conversion optimization

### Backend Integrations
- **Stripe** - payment processing, subscriptions, webhooks
- **Postmark** - transactional email service
- **Postcard Mania** - automated physical postcard fulfillment
- **Google Places API** - address autocomplete and verification
- **Hotjar** - user behavior analytics

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 19, TypeScript, React Router 7 |
| Backend | Node.js, Express |
| Payments | Stripe |
| Email | Postmark |
| Fulfillment | Postcard Mania DirectMail API v3 |
| Analytics | Hotjar |
| Hosting | Render |

## Project Structure

```
positive-postcards-site/
├── client/                     # React frontend
│   ├── public/                 # Static assets
│   └── src/
│       ├── components/         # Reusable UI components
│       │   ├── AddressAutocomplete/
│       │   ├── Cart/
│       │   ├── CountdownTimer/
│       │   ├── DownsellModal/
│       │   ├── EmailOptInForm/
│       │   ├── Footer/
│       │   ├── Navigation/
│       │   ├── PromoOfferBanner/
│       │   └── UpsellModal/
│       ├── contexts/           # React contexts (Cart, Auth)
│       ├── pages/              # Page components
│       │   ├── AuthVerify/
│       │   ├── Business/
│       │   ├── Checkout/
│       │   ├── CheckoutSuccess/
│       │   ├── Dashboard/
│       │   ├── Home/
│       │   └── Login/
│       ├── config/             # Configuration (Stripe)
│       ├── types/              # TypeScript interfaces
│       └── utils/              # Helpers (API, Hotjar)
├── server/                     # Express backend
│   ├── server.js               # Main server file
│   ├── config/
│   │   └── stripePrices.js     # Stripe price configuration
│   ├── services/
│   │   ├── emailService.js     # Postmark integration
│   │   └── postcardManiaService.js  # PCM integration
│   └── scripts/
│       └── setupStripeProducts.js   # Stripe product setup
├── markdown/                   # Documentation
│   ├── README_DASHBOARD.md
│   ├── README_PCM_INTEGRATION.md
│   ├── SECURITY.md
│   └── UPSELL_DOWNSELL_FLOW.md
└── API_HTML/                   # API documentation
```

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm
- Stripe account
- Google Cloud Platform account (for Places API)
- Postmark account (for transactional emails)
- Postcard Mania account (for fulfillment - optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JaceG/Positive-Postcards.git
   cd positive-postcards-site
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

   This starts:
   - React development server on http://localhost:3000
   - Express API server on http://localhost:3001

## Environment Variables

Create a `.env` file in the root directory:

```bash
# Stripe Configuration (Required)
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Google Places API (Required for address autocomplete)
GOOGLE_PLACES_API_KEY=AIza...

# Application URLs
REACT_APP_API_URL=http://localhost:3001
NODE_ENV=development

# Postmark Email Service (Required for emails)
POSTMARK_API_KEY=your_postmark_api_key
POSTMARK_SERVER_ID=your_postmark_server_id
EMAIL_FROM=noreply@positivepostcards.com

# Postcard Mania API (Required for fulfillment)
PCM_API_KEY=your_pcm_api_key
PCM_API_SECRET=your_pcm_api_secret
PCM_RETURN_COMPANY=Positive Postcards
PCM_RETURN_ADDRESS=123 Main Street
PCM_RETURN_CITY=Clearwater
PCM_RETURN_STATE=FL
PCM_RETURN_ZIP=33765

# Analytics (Optional)
REACT_APP_ENABLE_HOTJAR=false
```

## Pricing Structure

### Individual Subscriptions
| Plan | Price | Per Month |
|------|-------|-----------|
| Monthly | $120/month | $120 |
| Quarterly | $198/quarter | $66 |
| Annual | $720/year | $60 |

### Promotional Offers
| Offer | Price | Description |
|-------|-------|-------------|
| 7-Day Trial | $7 | Try for 7 days |
| 50% Off First Month | $60 | Half-price first month |
| Downsell | $90/month | 25% off standard |

### Business Plans
| Plan | Price | Description |
|------|-------|-------------|
| Starter | $90/person/month | For small teams |
| Growth | $80/person/month | Volume discount |

## API Endpoints

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/send-magic-link` | POST | Send login email |
| `/api/auth/verify` | GET | Verify login token |

### Payments & Subscriptions
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/create-payment-intent` | POST | Create one-time payment |
| `/api/create-subscription` | POST | Create subscription |
| `/api/prices` | GET | Get product prices |
| `/api/cancel-subscription` | POST | Cancel subscription |
| `/api/create-portal-session` | POST | Stripe billing portal |

### Subscription Management (Authenticated)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dashboard` | GET | Get customer data |
| `/api/subscription/current` | GET | Current subscription details |
| `/api/subscription/plans` | GET | Available plans |
| `/api/subscription/change-plan` | POST | Upgrade/downgrade |
| `/api/subscription/preview-change` | POST | Preview proration |
| `/api/subscription/pause` | POST | Pause subscription |
| `/api/subscription/resume` | POST | Resume subscription |
| `/api/subscription/reactivate` | POST | Reactivate cancelled |

### Google Places (Proxied)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/places/autocomplete` | GET | Address suggestions |
| `/api/places/details` | GET | Place details |

### Development/Testing Only
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/test-email` | POST | Test email service |
| `/api/pcm/test` | GET | Test PCM connection |
| `/api/pcm/designs` | GET | List PCM designs |
| `/api/pcm/test-order` | POST | Place test order |
| `/api/pcm/verify-address` | POST | Verify address |
| `/api/pcm/retry-queue` | GET | View failed orders |
| `/api/pcm/simulate-subscription` | POST | Simulate campaign |

### Webhooks
| Endpoint | Events Handled |
|----------|----------------|
| `/webhook` | `payment_intent.succeeded`, `subscription.created`, `subscription.updated`, `subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed` |

## Key Features Documentation

### Postcard Mania Integration
The system uses a **Content Calendar** approach with 365 pre-designed postcards (PP-001 through PP-365). When a customer subscribes, they enter the daily content stream at the current day and receive postcards for their subscription duration.

See [README_PCM_INTEGRATION.md](markdown/README_PCM_INTEGRATION.md) for full setup guide.

### Email Notifications
- **Magic Link Authentication** - secure passwordless login
- **Welcome Emails** - sent when subscription is created
- **Cancellation Confirmations** - sent when subscription is cancelled
- **Payment Failure Notifications** - sent when payment fails

See [README_DASHBOARD.md](markdown/README_DASHBOARD.md) for dashboard documentation.

### Sales Funnel
- **$7 Trial Banner** - homepage with 30-minute countdown timer
- **Upsell Modal** - upgrade trial to 50% off first month
- **Downsell Modal** - exit intent offer for hesitant customers

See [UPSELL_DOWNSELL_FLOW.md](markdown/UPSELL_DOWNSELL_FLOW.md) for flow documentation.

### Security
- API keys are server-side only
- Google Places API is proxied through the server
- Stripe webhooks use signature verification
- Environment variables for all configuration

See [SECURITY.md](markdown/SECURITY.md) for security documentation.

## Building for Production

1. **Build the client**
   ```bash
   npm run build
   ```

2. **Configure production environment**
   - Use live Stripe keys
   - Set `NODE_ENV=production`
   - Configure webhook endpoints
   - Verify Postmark sender domain
   - Use production PCM API keys

3. **Start production server**
   ```bash
   npm start
   ```

### Deployment Checklist
- [ ] Environment variables set in hosting platform
- [ ] Using production Stripe keys
- [ ] Google Places API key has IP restrictions
- [ ] Postmark domain verified
- [ ] PCM production keys configured
- [ ] Webhook endpoints configured
- [ ] SSL certificate enabled
- [ ] CORS configured for production domain

## Testing

### Test Credit Cards (Stripe Test Mode)
| Card Number | Result |
|-------------|--------|
| `4242 4242 4242 4242` | Success |
| `4000 0025 0000 3155` | Requires authentication |
| `4000 0000 0000 9995` | Declined |

Use any future expiry date and any 3-digit CVC.

### Demo Promo Code
- **SAVE10**: 10% discount at checkout

### Email Testing
```bash
# Test basic email
curl -X POST http://localhost:3001/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","type":"test"}'

# Test welcome email
curl -X POST http://localhost:3001/api/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","type":"welcome"}'
```

### PCM Testing
```bash
# Test connection
curl http://localhost:3001/api/pcm/test

# Simulate subscription campaign
curl -X POST http://localhost:3001/api/pcm/simulate-subscription \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","firstName":"Jane","lastName":"Smith","duration":7}'
```

## Troubleshooting

### Address autocomplete not working
- Check `GOOGLE_PLACES_API_KEY` is set
- Verify Places API is enabled in Google Cloud Console
- Check server logs for API errors

### Stripe payments failing
- Verify correct test/live keys are being used
- Check webhook configuration
- Ensure webhook secret matches

### Emails not sending
- Verify `POSTMARK_API_KEY` is correct
- Check sender domain is verified in Postmark
- Monitor server logs for email service errors

### Postcards not being ordered
- Verify PCM API credentials
- Check PCM sandbox vs production mode
- Ensure designs PP-001 through PP-365 exist

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start both servers in development |
| `npm run client` | Start React dev server only |
| `npm run server` | Start Express server only |
| `npm run build` | Build client for production |
| `npm run render-build` | Full build for Render deployment |
| `npm start` | Start production server |
| `npm run install:all` | Install all dependencies |

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

© 2026 Positive Postcards. All rights reserved.
