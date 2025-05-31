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

## 🔒 Security

This application follows security best practices:
- API keys are properly secured (see [SECURITY.md](SECURITY.md))
- Google Places API is proxied through the server
- Stripe secret keys are server-side only
- Environment variables are used for configuration

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone [your-repo-url]
   cd positive-postcards-site
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual API keys
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
│   │   ├── contexts/      # React contexts (Cart, etc.)
│   │   ├── pages/         # Page components
│   │   ├── types/         # TypeScript interfaces
│   │   └── utils/         # Helper functions
│   └── package.json
├── server/                # Express backend
│   ├── server.js          # Main server file
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
- Email validation
- Address autocomplete
- Promo code support (demo: "SAVE10")
- Gift shipping option
- Save payment method for future use

### Subscriptions
- Monthly: $60/month
- Quarterly: $99 (best value)
- Annual: $360/year
- Promotional offers available

## 🛠️ Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Stripe Keys
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Google Places API (server-side only)
GOOGLE_PLACES_API_KEY=AIza...

# API Configuration
REACT_APP_API_URL=http://localhost:3001
NODE_ENV=development
```

## 🏗️ Building for Production

1. **Build the client**
   ```bash
   cd client && npm run build
   ```

2. **Set production environment variables** in your hosting platform

3. **Deploy** following your hosting provider's instructions

## 🌐 API Endpoints

- `POST /api/create-payment-intent` - Create one-time payment
- `POST /api/create-subscription` - Create subscription
- `GET /api/prices` - Get product prices
- `GET /api/places/autocomplete` - Address suggestions (proxied)
- `GET /api/places/details` - Place details (proxied)
- `POST /api/webhook` - Stripe webhook handler

## 🌐 Domain

The site will be hosted at: **www.positivepost.cards**

## 📝 License

© 2025 Positive Postcards. All rights reserved.
