# Positive Postcards Dashboard & Authentication

## Overview

The Positive Postcards site now includes a user dashboard with magic link authentication, allowing customers to manage their subscriptions without requiring a traditional database.

## Key Features

### 1. Magic Link Authentication
- **No passwords required** - users login via secure email links
- Simple email-based authentication
- Sessions stored in memory (use Redis in production)
- 15-minute expiration for magic links
- 7-day session duration

### 2. Dashboard Features
- **Subscription Management**
  - View subscription status (Active/Paused/Cancelled)
  - See next billing date
  - Pause/resume subscription with optional resume date
  - Access Stripe's billing portal

- **Billing Portal Integration**
  - Update payment methods
  - View billing history and download invoices
  - Cancel subscriptions
  - Update billing address
  - Manage all billing details through Stripe's secure portal

### 3. How It Works

#### Login Flow:
1. User enters email on login page
2. System checks if customer exists in Stripe
3. Generates magic link token
4. In production: sends email with link
5. In demo: displays link directly (remove in production!)
6. User clicks link to authenticate
7. System creates session and redirects to dashboard

#### Dashboard Access:
- Protected routes require valid session token
- Sessions expire after 7 days
- Invalid/expired sessions redirect to login

### 4. Technical Implementation

#### Backend Endpoints:
- `POST /api/auth/send-magic-link` - Generate and send magic link
- `GET /api/auth/verify` - Verify token and create session
- `GET /api/dashboard` - Get customer data (requires auth)
- `POST /api/create-portal-session` - Create Stripe billing portal session
- `POST /api/subscription/pause` - Pause subscription
- `POST /api/subscription/resume` - Resume subscription

#### Frontend Components:
- **AuthContext** - Manages authentication state
- **Login Page** - Email entry for magic links
- **AuthVerify Page** - Handles magic link verification
- **Dashboard Page** - Subscription management interface

### 5. Security Considerations

#### Current Implementation (Demo):
- In-memory session storage
- Magic links shown in response (demo only)
- Basic token generation

#### Production Recommendations:
1. Use Redis or database for session storage
2. Send magic links via email service (SendGrid, AWS SES, etc.)
3. Use cryptographically secure token generation
4. Implement rate limiting on auth endpoints
5. Add CSRF protection
6. Use HTTPS everywhere
7. Implement proper logging and monitoring

### 6. Stripe Configuration

To enable the billing portal, configure it in your Stripe Dashboard:
1. Go to Settings → Billing → Customer portal
2. Enable features you want customers to access:
   - Payment method updates
   - Invoice history
   - Subscription cancellation
   - Billing address updates

### 7. Testing the Dashboard

1. Create a subscription through the checkout flow
2. Go to `/login`
3. Enter the email used for checkout
4. Click the demo link (in production, check email)
5. You'll be redirected to the dashboard
6. Test features:
   - Pause/resume subscription
   - Open billing portal
   - View subscription details

### 8. Environment Variables

Make sure these are set:
```bash
# Backend (.env)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret

# Frontend (.env)
REACT_APP_API_URL=http://localhost:5001
REACT_APP_STRIPE_PUBLIC_KEY=your_stripe_public_key
```

### 9. Future Enhancements

- Email service integration for sending magic links
- Two-factor authentication option
- Subscription upgrade/downgrade in dashboard
- Usage statistics and analytics
- Gift subscription management
- Referral program tracking
- Address book for multiple shipping addresses 