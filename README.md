# Positive Postcards - E-commerce Site

Transform your mindset with daily affirmation postcards delivered to your door. This is the full e-commerce platform for Positive Postcards, a subscription service that delivers beautiful, meaningful mail that creates lasting positive change.

## 🌟 Features

- Beautiful, responsive landing page design
- Full shopping cart functionality with localStorage persistence
- Secure checkout with Stripe integration
- Address autocomplete with Google Places API (server-proxied)
- Subscription and one-time purchase options
- Business/bulk ordering
- Customer dashboard for subscription management
- Email opt-in with promotional offers
- Upsell/downsell flow with promotional offers
- Hotjar analytics integration for user behavior tracking
- **Postmark email service integration** for transactional emails
- **Postcard Mania API integration** for automated postcard fulfillment

## 🔒 Security

This application follows security best practices:
- API keys are properly secured (see [SECURITY.md](SECURITY.md))
- Google Places API is proxied through the server
- Stripe secret keys are server-side only
- Environment variables are used for configuration
- Build folders are excluded from version control
- Email service API keys are server-side only

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Stripe account (for payments)
- Google Cloud Platform account (for Places API)
- Hotjar account (for analytics)
- **Postmark account (for transactional emails)**

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/JaceG/Positive-Postcards.git
   cd positive-postcards-site
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual API keys (see Environment Variables section below)
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Start both servers**
   ```bash
   npm run dev
   ```

   This will start:
   - React development server on http://localhost:3000
   - Express API server on http://localhost:3001

## 📂 Project Structure

```
positive-postcards-site/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── contexts/      # React contexts (Cart, Auth)
│   │   ├── pages/         # Page components
│   │   ├── types/         # TypeScript interfaces
│   │   ├── utils/         # Helper functions (API, Hotjar)
│   │   └── config/        # Configuration files
│   └── package.json
├── server/                # Express backend
│   ├── server.js          # Main server file
│   ├── services/          # Service modules
│   │   └── emailService.js # Postmark email service
│   └── package.json
├── .env.example           # Environment variable template
├── .gitignore
├── SECURITY.md           # Security documentation
└── package.json          # Root package.json
```

## 🎨 Key Features

### Shopping Cart
- Add individual subscriptions (monthly, quarterly, annual)
- Add business packages
- Persistent cart using localStorage
- Real-time price calculations

### Checkout
- Secure payment processing with Stripe
- Email validation with real-time feedback
- Address autocomplete (server-proxied for security)
- Promo code support (demo: "SAVE10" for 10% off)
- Gift shipping option
- Save payment method for future use
- Upsell/downsell modals with promotional offers
- Complete analytics tracking

### Subscriptions & Pricing
- **Monthly**: $60/month
- **Quarterly**: $99 (best value - $33/month)
- **Annual**: $360/year ($30/month)
- **Promotional Offers**:
  - 7-day trial for $7
  - 50% off first month ($37.50)

### Email Notifications
- **Magic link authentication emails** - secure login without passwords
- **Welcome emails** - sent when subscription is created
- **Cancellation confirmations** - sent when subscription is cancelled
- **Payment failure notifications** - sent when payment processing fails
- **Beautiful HTML templates** with responsive design
- **Automatic fallback** to demo mode if email service is unavailable

### Analytics & Tracking
- Hotjar integration for user behavior analysis
- Event tracking throughout the user journey:
  - Page visits
  - Checkout process steps
  - Upsell/downsell interactions
  - Error tracking
  - Conversion funnel analysis

## 🛠️ Environment Variables

Create a `.env` file based on `.env.example` with the following variables:

### Required Variables

```bash
# Stripe Configuration
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_... # From Stripe Dashboard
STRIPE_SECRET_KEY=sk_test_...                # From Stripe Dashboard (server-side only)

# Google Places API (server-side only for security)
GOOGLE_PLACES_API_KEY=AIza...               # From Google Cloud Console

# Application Configuration
REACT_APP_API_URL=http://localhost:3001     # Backend URL
NODE_ENV=development                         # Environment (development/production)

# Analytics
REACT_APP_ENABLE_HOTJAR=false              # Set to 'true' to enable in development

# Postmark Email Service
POSTMARK_API_KEY=your_postmark_api_key      # From Postmark Dashboard
POSTMARK_SERVER_ID=your_postmark_server_id  # From Postmark Dashboard
EMAIL_FROM=noreply@positivepostcards.com    # Verified sender address

# Postcard Mania API (for postcard fulfillment)
PCM_API_KEY=your_pcm_api_key                # From PCM Integrations Portal
PCM_API_SECRET=your_pcm_api_secret          # From PCM Integrations Portal
PCM_RETURN_COMPANY=Positive Postcards       # Return address company name
PCM_RETURN_ADDRESS=123 Main Street          # Return address
PCM_RETURN_CITY=Clearwater                  # Return address city
PCM_RETURN_STATE=FL                         # Return address state
PCM_RETURN_ZIP=33765                        # Return address zip
```

### Optional Variables

```bash
# Stripe Webhooks (for production)
STRIPE_WEBHOOK_SECRET=whsec_...             # Webhook endpoint secret
```

### Getting API Keys

1. **Stripe Keys**:
   - Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
   - Copy your publishable key (safe for client-side)
   - Copy your secret key (server-side only)

2. **Google Places API**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Enable Places API and Maps JavaScript API
   - Create an API key
   - **Important**: Set IP restrictions for production

3. **Hotjar**:
   - Create account at [Hotjar](https://www.hotjar.com/)
   - Get your Site ID (already configured: 6421588)
   - Analytics will be automatically enabled in production

4. **Postmark Email Service**:
   - Create account at [Postmark](https://postmarkapp.com/)
   - Create a server for transactional emails
   - Get your API key from the API Tokens section
   - Get your Server ID from the server settings
   - **Verify your sender domain** in the Signatures section

5. **Postcard Mania API** (for postcard fulfillment):
   - Create account at [Postcard Mania](https://www.postcardmania.com/)
   - Access the [PCM Integrations Portal](https://pcmintegrations.com/)
   - Go to My Account → API Keys
   - Generate Sandbox keys for testing (orders not processed)
   - Generate Production keys for live mailings
   - **Create 365 designs** named PP-001 through PP-365 in the dashboard
   - See [README_PCM_INTEGRATION.md](README_PCM_INTEGRATION.md) for full setup guide

## 📊 Analytics Configuration

Hotjar is configured to:
- **Development**: Disabled by default (set `REACT_APP_ENABLE_HOTJAR=true` to enable)
- **Production**: Automatically enabled

### Tracked Events
- Homepage visits and interactions
- Checkout flow completion/abandonment
- Upsell/downsell conversions
- Promo code usage
- Error occurrences
- Payment method creation
- Gift purchases

## 📧 Email Service Configuration

The application uses [Postmark](https://postmarkapp.com/) for reliable transactional email delivery:

### Email Types
- **Magic Link Authentication** - Secure login emails with 15-minute expiration
- **Welcome Emails** - Sent automatically when subscriptions are created
- **Cancellation Confirmations** - Sent when subscriptions are cancelled
- **Payment Failure Notifications** - Sent when payment processing fails

### Development Mode
- If Postmark is not configured, emails will show as demo links in the console
- Test endpoint available: `POST /api/test-email` with types: `test`, `welcome`, `cancellation`, `payment-failed`

### Production Setup
1. **Verify your domain** in Postmark's Signatures section
2. **Set up DKIM and SPF records** for better deliverability
3. **Configure webhooks** (optional) for delivery tracking
4. **Monitor email analytics** in the Postmark dashboard

## 🏗️ Building for Production

1. **Build the client**
   ```bash
   npm run build
   ```
   This runs `cd client && npm ci && npm run build`

2. **Set production environment variables** in your hosting platform:
   - Use live Stripe keys instead of test keys
   - Set `NODE_ENV=production`
   - Configure webhook endpoints
   - **Add Postmark production API key**

3. **Start the production server**
   ```bash
   npm start
   ```
   This runs the server from `server/server.js`

4. **Deploy** following your hosting provider's instructions

### Deployment Checklist
- [ ] Environment variables set in hosting platform
- [ ] Using production Stripe keys
- [ ] Google Places API key has IP restrictions
- [ ] **Postmark domain verified and API key configured**
- [ ] Webhook endpoints configured
- [ ] Domain configured (www.positivepost.cards)
- [ ] SSL certificate enabled

## 🌐 API Endpoints

### Payment Processing
- `POST /api/create-payment-intent` - Create one-time payment
- `POST /api/create-subscription` - Create subscription
- `GET /api/prices` - Get/create product prices
- `POST /api/cancel-subscription` - Cancel subscription

### Google Places (Proxied for Security)
- `GET /api/places/autocomplete` - Address suggestions
- `GET /api/places/details` - Place details

### Authentication & User Management
- `POST /api/auth/send-magic-link` - Send login link via email
- `GET /api/auth/verify` - Verify login token
- `GET /api/dashboard` - Get customer data
- `POST /api/create-portal-session` - Stripe billing portal

### Email Service (Development Only)
- `POST /api/test-email` - Send test emails (available in development mode)

### Postcard Mania (Development Only)
- `GET /api/pcm/test` - Test PCM API connection
- `GET /api/pcm/designs` - List all designs from PCM account
- `POST /api/pcm/test-order` - Place a test postcard order
- `POST /api/pcm/verify-address` - Verify recipient address
- `GET /api/pcm/retry-queue` - View failed orders queue
- `POST /api/pcm/simulate-subscription` - Simulate full subscription campaign

### Webhooks
- `POST /webhook` - Stripe webhook handler (triggers PCM postcard campaigns)

## 🧪 Testing

### Test Credit Cards (Stripe Test Mode)
- **Success**: `4242 4242 4242 4242`
- **Requires Authentication**: `4000 0025 0000 3155`
- **Declined**: `4000 0000 0000 9995`

Use any future date for expiry and any 3 digits for CVC.

### Demo Promo Code
- **SAVE10**: 10% discount on checkout

### Email Testing (Development)
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

## 🚨 Troubleshooting

### Common Issues

1. **Address autocomplete not working**:
   - Check Google Places API key is set in server environment
   - Verify API key has Places API enabled
   - Check server logs for API errors

2. **Stripe payments failing**:
   - Ensure you're using the correct test/live keys
   - Check webhook configuration
   - Verify card test numbers

3. **Hotjar not loading**:
   - Check Site ID configuration in `utils/hotjar.ts`
   - Verify `REACT_APP_ENABLE_HOTJAR=true` for development
   - Check browser console for errors

4. **Emails not sending**:
   - Verify Postmark API key is correct
   - Check that sender domain is verified in Postmark
   - Monitor server logs for email service errors
   - Ensure `EMAIL_FROM` matches a verified sender signature

## 🌐 Domain

The site will be hosted at: **www.positivepost.cards**

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📝 License

© 2026 Positive Postcards. All rights reserved.
