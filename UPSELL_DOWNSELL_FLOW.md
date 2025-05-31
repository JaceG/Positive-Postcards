# Upsell/Downsell Flow Documentation

## Overview
The Positive Postcards site implements a sophisticated sales funnel with multiple touchpoints to maximize conversions while providing value to customers.

## Flow Diagram

```
Homepage with $7 Trial Banner (30-min countdown)
    ↓
User clicks "Start Your $7 Trial Now"
    ↓
Checkout Page (Trial mode active)
    ↓
User fills form and clicks "Start 7-Day Trial for $7"
    ↓
🔸 UPSELL MODAL: "Upgrade to 50% off first month ($37.50)"
    ├─ Accept → Changes to 50% off pricing → Process payment
    └─ Decline → Continue with $7 trial → Process payment

OR

Regular Checkout (no promo active)
    ↓
User moves mouse to leave page (exit intent)
    ↓
🔸 DOWNSELL MODAL: "Try risk-free for 7 days - only $7"
    ├─ Accept → Changes to trial pricing
    └─ Decline → Continue with regular pricing
```

## Implementation Details

### 1. **Initial Offer: $7 Trial**
- Displayed on homepage with 30-minute countdown timer
- Timer persists across page refreshes using localStorage
- Creates urgency with visual states (warning at 10min, urgent at 5min)

### 2. **Upsell: 50% Off First Month ($37.50)**
- Triggered when trial users attempt checkout
- Shows value comparison: 7 days vs 30 days
- One-time offer presented before payment

### 3. **Downsell: $7 Trial (Exit Intent)**
- Triggered by exit intent for regular-price customers
- Last chance to reduce commitment barrier
- Only shows once per session

### 4. **Stripe Integration**
- `promo_trial_7days`: $7 for 7-day trial
- `promo_first_month_half`: $37.50 for first month (50% off)
- Regular pricing: $60/month after promotional period

## User Experience Benefits

1. **Multiple Entry Points**: Different price points for different comfort levels
2. **Progressive Commitment**: Start small ($7) with option to upgrade
3. **Urgency & Scarcity**: Countdown timers and one-time offers
4. **Risk Reversal**: Low-cost trial reduces purchase anxiety
5. **Value Anchoring**: Shows savings clearly ($75 → $37.50)

## Technical Features

- **Persistent State**: Countdown timer survives refreshes
- **Smart Detection**: Exit intent only triggers under specific conditions
- **Responsive Design**: All modals work on mobile
- **Clean Transitions**: Smooth animations and clear CTAs
- **Flexible Pricing**: Easy to adjust offers in Stripe

## Revenue Optimization

This funnel structure typically increases conversions by:
- Reducing initial commitment barrier ($7 vs $60)
- Capturing price-sensitive customers with discounts
- Maximizing average order value through upsells
- Preventing abandonment with exit-intent offers 