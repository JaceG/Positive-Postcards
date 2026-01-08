# Postcard Mania Integration

## Overview

This integration connects Positive Postcards with the [Postcard Mania DirectMail API v3](https://docs.pcmintegrations.com/docs/directmail-api/92547af449aa8-direct-mail-api-v3) to automatically fulfill postcard orders when customers subscribe.

## How It Works

### Content Calendar Approach (Option B)

The integration uses a **Content Calendar** approach:

1. **365 Pre-designed Postcards**: You create 365 unique postcard designs in the PCM dashboard, named `PP-001` through `PP-365`
2. **Daily Content Stream**: Each day of the year has a specific design
3. **Subscriber Entry Point**: When a customer subscribes, they enter the "stream" at the current day
4. **Continuous Delivery**: They receive postcards starting from their entry point for the duration of their subscription

### Subscription Flow

```
Customer subscribes (Jan 15th)
     ↓
Stripe webhook: subscription.created
     ↓
Calculate: Today is Day 15 of the year
     ↓
Determine duration: Trial=7, Monthly=30, Quarterly=90, Annual=365
     ↓
Place PCM orders for Days 15-44 (for monthly)
     ↓
Store order IDs in Stripe subscription metadata
     ↓
Postcards mailed daily starting immediately
```

## Setup

### 1. Get PCM API Credentials

1. Log into your [PCM Integrations Portal](https://pcmintegrations.com/)
2. Go to **My Account** → **API Keys**
3. Choose **Sandbox** (for testing) or **Production** (for live mailings)
4. Generate a new API key and secret

### 2. Configure Environment Variables

Add these to your `.env` file:

```bash
# API Credentials (required)
PCM_API_KEY=your_pcm_api_key_here
PCM_API_SECRET=your_pcm_api_secret_here

# Optional: Child app reference
PCM_CHILD_REF_NBR=

# Return Address (printed on postcards)
PCM_RETURN_COMPANY=Positive Postcards
PCM_RETURN_ADDRESS=123 Main Street
PCM_RETURN_CITY=Clearwater
PCM_RETURN_STATE=FL
PCM_RETURN_ZIP=33765

# Default Settings
PCM_DEFAULT_SIZE=46
PCM_DEFAULT_MAIL_CLASS=FirstClass
```

### 3. Create Designs in PCM Dashboard

1. Log into the PCM dashboard
2. Create 365 postcard designs
3. Name them: `PP-001`, `PP-002`, ..., `PP-365`
4. Each design represents one day of the year

**Tip**: Start with fewer designs (e.g., 30 for a month) and expand as you go.

## API Endpoints

### Development/Testing Endpoints

These endpoints are only available when `NODE_ENV !== 'production'`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/pcm/test` | GET | Test API connection and authentication |
| `/api/pcm/designs` | GET | List all designs from PCM account |
| `/api/pcm/test-order` | POST | Place a test postcard order |
| `/api/pcm/verify-address` | POST | Verify a recipient address |
| `/api/pcm/retry-queue` | GET | View failed orders queue |
| `/api/pcm/process-retry-queue` | POST | Manually process retry queue |
| `/api/pcm/simulate-subscription` | POST | Simulate a full subscription campaign |

### Example: Test Connection

```bash
curl http://localhost:3001/api/pcm/test
```

Response:
```json
{
  "configured": true,
  "authenticated": true,
  "designCount": 365,
  "tokenExpires": 1704844800000
}
```

### Example: Place Test Order

```bash
curl -X POST http://localhost:3001/api/pcm/test-order \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "address": "123 Main St",
    "city": "Clearwater",
    "state": "FL",
    "zipCode": "33765",
    "designId": 1
  }'
```

### Example: Simulate Subscription

```bash
curl -X POST http://localhost:3001/api/pcm/simulate-subscription \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "address": "456 Oak Ave",
    "city": "Tampa",
    "state": "FL",
    "zipCode": "33601",
    "duration": 7
  }'
```

## PCM API Reference

### Place Postcard Order

**Endpoint:** `POST https://v3.pcmintegrations.com/order/postcard`

**Key Fields:**
- `mailClass`: "FirstClass" or "Standard"
- `size`: "46" (4x6), "68" (6x8), "69" (6x9), "611" (6x11)
- `designID`: Your design ID from PCM dashboard
- `mailDate`: "YYYY-MM-DD" format
- `recipients`: Array of recipient objects
- `returnAddress`: Your return address

**Recipient Object:**
```json
{
  "firstName": "Alex",
  "lastName": "Doe",
  "company": "",
  "address": "2145 Sunnydale Blvd",
  "address2": "Bldg. 102",
  "city": "Clearwater",
  "state": "FL",
  "zipCode": "33765",
  "extRefNbr": "optional-tracking-id",
  "variables": [
    { "key": "customField", "value": "customValue" }
  ]
}
```

### Get All Designs

**Endpoint:** `GET https://v3.pcmintegrations.com/design`

### Cancel Order

**Endpoint:** `DELETE https://v3.pcmintegrations.com/order/{orderId}`

### Verify Recipients

**Endpoint:** `POST https://v3.pcmintegrations.com/recipient/verify`

## Error Handling

The integration implements three error handling strategies:

### 1. Automatic Retry Queue

Failed orders are automatically added to a retry queue:
- Maximum 3 retry attempts
- 1-second delay between retries
- Orders exceeding max retries trigger admin notification

### 2. Manual Review Queue

View and process failed orders:
```bash
# View queue
curl http://localhost:3001/api/pcm/retry-queue

# Process queue
curl -X POST http://localhost:3001/api/pcm/process-retry-queue
```

### 3. Admin Notifications

Critical failures trigger admin notifications (logged to console, can be extended to email/Slack).

## Subscription Lifecycle

### New Subscription

When `subscription.created` webhook fires:
1. Welcome email sent via Postmark
2. Shipping address extracted from Stripe metadata
3. Address verified via PCM API
4. Postcard orders placed for subscription duration
5. Order IDs stored in Stripe subscription metadata

### Subscription Cancellation

When `subscription.deleted` webhook fires:
1. Cancellation email sent
2. Pending PCM orders cancelled using stored order IDs

### Subscription Renewal

When `invoice.payment_succeeded` webhook fires for subscription renewals:
- (To be implemented) Trigger next batch of postcard orders

## Sandbox vs Production

### Sandbox Mode
- Orders are **NOT** automatically processed
- Safe for testing without sending real mail
- Use sandbox API keys

### Production Mode
- Orders **ARE** automatically processed and mailed
- Use production API keys
- Verify return address and designs are correct before switching

## Troubleshooting

### "API credentials not configured"

Ensure `PCM_API_KEY` and `PCM_API_SECRET` are set in your `.env` file.

### "Authentication failed"

- Verify your API key and secret are correct
- Check if you're using sandbox vs production credentials
- Ensure your PCM account is in good standing

### "Design not found for day X"

- Verify designs are named correctly (`PP-001` format)
- Refresh design cache: `GET /api/pcm/designs?refresh=true`

### Address verification failed

The integration continues even if verification fails but logs a warning. Check:
- Address format is correct
- State is valid 2-letter code
- Zip code is valid

## Cost Considerations

Each postcard order costs money! Be careful when testing:
- Use **Sandbox** mode for development
- Sandbox orders are not charged or mailed
- Only switch to Production when ready for real mailings

## Files Modified

- `server/services/postcardManiaService.js` - Main PCM integration service
- `server/server.js` - Webhook handlers and test endpoints
- `.env` - Configuration variables

## Documentation Links

- [PCM API v3 Documentation](https://docs.pcmintegrations.com/docs/directmail-api/92547af449aa8-direct-mail-api-v3)
- [Place Postcard Order](https://docs.pcmintegrations.com/docs/directmail-api/24b58db675dad-place-postcard-order)
- [Get All Designs](https://docs.pcmintegrations.com/docs/directmail-api/3d3a3000ff275-get-all-designs)
- [Cancel Order](https://docs.pcmintegrations.com/docs/directmail-api/iuc7kuzptpgwv-cancel-order)
- [Verify Recipients](https://docs.pcmintegrations.com/docs/directmail-api/k49y925eo4waw-verify-recipients)
