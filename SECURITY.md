# Security Configuration

## API Key Management

This application follows security best practices for handling API keys:

### 1. **Client-Side Keys**
- Only the Stripe **publishable** key is exposed client-side
- This key is safe to expose as it can only be used for creating tokens
- Stored in `REACT_APP_STRIPE_PUBLISHABLE_KEY` environment variable

### 2. **Server-Side Keys**
The following sensitive keys are kept server-side only:
- **Stripe Secret Key** (`STRIPE_SECRET_KEY`) - for payment processing
- **Google Places API Key** (`GOOGLE_PLACES_API_KEY`) - for address autocomplete
- **Stripe Webhook Secret** (`STRIPE_WEBHOOK_SECRET`) - for webhook verification

### 3. **Google Places API Security**
- The Google Places API key is **never exposed to the client**
- All Places API requests are proxied through our server endpoints:
  - `/api/places/autocomplete` - for address suggestions
  - `/api/places/details` - for place details
- This prevents the API key from being exposed in browser code

### 4. **Environment Files**
- `.env` files are gitignored and should never be committed
- Use `.env.example` as a template for required variables
- Different `.env` files for different environments:
  - `.env` - local development
  - `.env.production` - production (set in hosting platform)

### 5. **Production Deployment**
When deploying to production:
1. Set environment variables in your hosting platform (Vercel, Netlify, etc.)
2. Never hardcode API keys in source code
3. Use production API keys, not test keys
4. Enable API key restrictions in Google Cloud Console
5. Set up webhook endpoints with proper signatures

### 6. **API Key Restrictions**
Recommended restrictions for production:
- **Google Places API**: Restrict to your server's IP address
- **Stripe Keys**: Use restricted keys with minimal permissions
- **Domain Restrictions**: Limit API usage to your domains only

## Security Checklist
- [ ] All sensitive keys are in `.env` and not committed
- [ ] Google Places API is proxied through server
- [ ] Production uses different keys than development
- [ ] API keys have appropriate restrictions
- [ ] Webhook signatures are verified
- [ ] HTTPS is enforced in production 