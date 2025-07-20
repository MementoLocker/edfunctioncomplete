# Infrastructure Health Check Guide

## 1. Supabase Verification

### Vercel Environment Variables
**Location**: Vercel Dashboard → Your Project → Settings → Environment Variables

Check that these variables exist and are set for Production, Preview, and Development:
- [ ] `VITE_SUPABASE_URL` = `https://umrxpbudpexhgpnynstb.supabase.co`
- [ ] `VITE_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (starts with eyJ)

### Edge Functions Deployment
**Location**: Supabase Dashboard → Edge Functions

Verify these functions are deployed and show "Active" status:
- [ ] `create-checkout-session`
- [ ] `stripe-webhook` 
- [ ] `send-contact-email`

**Function URLs should be**:
- `https://umrxpbudpexhgpnynstb.supabase.co/functions/v1/create-checkout-session`
- `https://umrxpbudpexhgpnynstb.supabase.co/functions/v1/stripe-webhook`
- `https://umrxpbudpexhgpnynstb.supabase.co/functions/v1/send-contact-email`

### Backend Secrets
**Location**: Supabase Dashboard → Project Settings → Vault

Verify these secrets exist:
- [ ] `STRIPE_SECRET_KEY` (starts with `sk_live_` for production)
- [ ] `STRIPE_WEBHOOK_SECRET` (starts with `whsec_`)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (starts with `eyJ`)
- [ ] `RESEND_API_KEY` (starts with `re_`)

## 2. Stripe Verification

### Account Mode
**Location**: Stripe Dashboard (top left corner)
- [ ] Toggle shows "Live Mode" (not "Test Mode")
- [ ] URL shows `dashboard.stripe.com` (not `dashboard.stripe.com/test`)

### Live Products and Prices
**Location**: Stripe Dashboard → Products

Verify these products exist in Live Mode with correct Price IDs:
- [ ] **Keepsake Plan**: `price_1RmO6mBOaon0OwkPSX25QVac`
- [ ] **Heirloom Plan**: `price_1RmO7rBOaon0OwkPc1i7XUW2`
- [ ] **Legacy Plan**: `price_1RmO8nBOaon0OwkPk6qfS5RE`
- [ ] **Music Pro Plan**: `price_1RmO9UBOaon0OwkPqJ8cIMZA`

### Webhook Configuration
**Location**: Stripe Dashboard → Developers → Webhooks

Verify webhook exists with:
- [ ] **Endpoint URL**: `https://umrxpbudpexhgpnynstb.supabase.co/functions/v1/stripe-webhook`
- [ ] **Status**: Enabled
- [ ] **Events**: 
  - `checkout.session.completed`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- [ ] **Webhook Secret**: Matches the one in Supabase Vault

## 3. Resend Verification

### Domain Status
**Location**: Resend Dashboard → Domains

Verify:
- [ ] `mementolocker.com` domain is listed
- [ ] Status shows "Verified" (green checkmark)
- [ ] All DNS records are properly configured

### API Key
**Location**: Resend Dashboard → API Keys
- [ ] API key exists and is active
- [ ] Key matches the one stored in Supabase Vault

## 4. Database Schema Verification

### Required Tables
**Location**: Supabase Dashboard → Table Editor

Verify these tables exist with RLS enabled:
- [ ] `profiles` - User profile data
- [ ] `capsules` - Time capsule data  
- [ ] `reviews` - Customer reviews
- [ ] `waitlist` - Custom song waitlist
- [ ] `sponsors` - Advanced scheduling sponsors

### Storage Buckets
**Location**: Supabase Dashboard → Storage

Verify these buckets exist:
- [ ] `avatars` - Profile pictures (public)
- [ ] `review-photos` - Review photos (public)

## 5. Quick Functionality Tests

### Test Authentication
1. [ ] Visit your live site
2. [ ] Try to sign up with a test email
3. [ ] Check if user appears in Supabase Auth → Users

### Test Contact Form
1. [ ] Fill out contact form on live site
2. [ ] Check if email arrives at support@mementolocker.com
3. [ ] Verify no errors in Supabase Edge Functions logs

### Test Payment Flow (Use a real card - will be refunded)
1. [ ] Try to subscribe to a plan
2. [ ] Check if redirected to Stripe Checkout
3. [ ] Complete payment with real card details
4. [ ] Verify redirect to success page
5. [ ] Check if user's subscription_status updates in Supabase
6. [ ] Immediately refund the test payment in Stripe Dashboard

## 6. Error Monitoring

### Supabase Logs
**Location**: Supabase Dashboard → Logs

Check for recent errors in:
- [ ] Edge Function logs
- [ ] Database logs
- [ ] Auth logs

### Vercel Deployment
**Location**: Vercel Dashboard → Your Project → Functions

- [ ] Latest deployment shows "Ready" status
- [ ] No build errors in deployment logs

---

## Troubleshooting Common Issues

### If Vercel Environment Variables Are Missing:
1. Go to Vercel Dashboard → Settings → Environment Variables
2. Add missing variables for all environments (Production, Preview, Development)
3. Redeploy the project

### If Edge Functions Aren't Deployed:
1. Check if functions exist in `/supabase/functions/` directory
2. Redeploy functions using Supabase CLI or dashboard

### If Stripe Webhook Isn't Working:
1. Verify webhook URL is exactly: `https://umrxpbudpexhgpnynstb.supabase.co/functions/v1/stripe-webhook`
2. Check webhook secret matches Supabase Vault
3. Test webhook delivery in Stripe Dashboard

### If Resend Domain Isn't Verified:
1. Check DNS records in your domain provider
2. Wait for DNS propagation (up to 24 hours)
3. Re-verify domain in Resend dashboard

---

**Next Steps**: Complete this checklist and report back with any items that show as ❌ or any errors you encounter. Once all items are ✅, we can proceed with testing specific user flows.