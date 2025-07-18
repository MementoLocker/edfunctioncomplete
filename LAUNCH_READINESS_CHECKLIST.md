# MementoLocker - Final Launch Readiness & System Test Plan

## Part 1: Technical Configuration Verification

### 1. Vercel Hosting Configuration

#### Deployment Status
- [ ] **Live Site Access**: Verify https://edfunctioncomplete.vercel.app loads without errors
- [ ] **Build Status**: Confirm latest deployment shows "Ready" status in Vercel dashboard
- [ ] **Domain Configuration**: Ensure custom domain (if applicable) is properly configured
- [ ] **SSL Certificate**: Verify HTTPS is working correctly with valid SSL certificate

#### Environment Variables in Vercel
Navigate to Vercel Dashboard → Project Settings → Environment Variables and verify:

- [ ] **VITE_SUPABASE_URL**: Set to `https://umrxpbudpexhgpnynstb.supabase.co`
- [ ] **VITE_SUPABASE_ANON_KEY**: Set to your anon key (starts with `eyJhbGciOiJIUzI1NiIs...`)
- [ ] **Environment Scope**: Both variables set for Production, Preview, and Development
- [ ] **Variable Visibility**: Confirm variables are accessible to the build process

### 2. Supabase Backend Configuration

#### Database Security (RLS Policies)
Verify Row Level Security is enabled on all tables:

- [ ] **profiles table**: RLS enabled with user-specific access policies
- [ ] **capsules table**: RLS enabled with user ownership policies  
- [ ] **reviews table**: RLS enabled with public read for verified reviews
- [ ] **waitlist table**: RLS enabled with public insert access
- [ ] **sponsors table**: RLS enabled with subscriber-specific access

#### Edge Functions Deployment
Confirm all functions are deployed and accessible:

- [ ] **create-checkout-session**: Function deployed and responding
- [ ] **stripe-webhook**: Function deployed and webhook URL accessible
- [ ] **send-contact-email**: Function deployed for contact form

#### Production Secrets in Supabase Vault
Navigate to Supabase Dashboard → Project Settings → Vault and verify:

- [ ] **STRIPE_SECRET_KEY**: Live Stripe secret key (starts with `sk_live_`)
- [ ] **STRIPE_WEBHOOK_SECRET**: Webhook endpoint secret (starts with `whsec_`)
- [ ] **SUPABASE_SERVICE_ROLE_KEY**: Service role key for admin operations
- [ ] **RESEND_API_KEY**: Resend API key for email functionality

### 3. Stripe Payments Configuration

#### Live Mode Setup
- [ ] **Account Mode**: Stripe dashboard shows "Live Mode" (not Test Mode)
- [ ] **Payment Methods**: Credit/debit cards enabled for your region
- [ ] **Products Created**: All subscription products exist in live mode
- [ ] **Tax Configuration**: Tax settings configured if required for your jurisdiction

#### Webhook Configuration
- [ ] **Webhook Endpoint**: Active webhook pointing to `https://umrxpbudpexhgpnynstb.supabase.co/functions/v1/stripe-webhook`
- [ ] **Events Subscribed**: 
  - `checkout.session.completed`
  - `customer.subscription.updated` 
  - `customer.subscription.deleted`
- [ ] **Webhook Secret**: Matches the secret stored in Supabase Vault
- [ ] **Webhook Status**: Shows "Enabled" and recent successful deliveries

### 4. Resend Email Configuration

#### Domain Verification
- [ ] **Domain Status**: Sending domain verified in Resend dashboard
- [ ] **DNS Records**: All required DNS records properly configured
- [ ] **From Address**: `noreply@mementolocker.com` configured and verified
- [ ] **Reply-To Setup**: Contact form replies properly configured

---

## Part 2: End-to-End System Test Plan

### Test Objective
Complete user journey from signup through payment processing to capsule scheduling and delivery confirmation.

### Pre-Test Setup
1. **Test Email**: Use a real email address you can access for testing
2. **Live Payment**: Prepare a real credit card for live transaction testing (will be refunded after verification)
3. **Browser**: Use incognito/private browsing mode to simulate new user
4. **Documentation**: Keep screenshots and notes of each step

---

### Test Scenario 1: New User Registration & Trial

#### Step 1: Initial Site Access
1. Navigate to https://edfunctioncomplete.vercel.app
2. **Verify**: Site loads completely without console errors
3. **Verify**: All images, fonts, and styles load correctly
4. **Verify**: Navigation menu is functional

#### Step 2: User Registration
1. Click "Sign In" button in header
2. Switch to "Sign Up" mode in modal
3. Enter test details:
   - **Name**: Test User
   - **Email**: [your-test-email@domain.com]
   - **Password**: TestPassword123!
4. Click "Create Account"
5. **Verify**: Welcome modal appears
6. **Verify**: User is redirected and logged in
7. **Verify**: Header shows user name and profile menu

#### Step 3: Trial Setup Verification
1. Navigate to "My Subscription" page
2. **Verify**: Shows "30-Day Free Trial" status
3. **Verify**: Trial days remaining counter is accurate
4. **Verify**: Trial benefits are listed correctly

---

### Test Scenario 2: Time Capsule Creation

#### Step 4: Create First Capsule
1. Click "Create New Capsule" button
2. **Verify**: Creation interface loads without errors
3. Fill in capsule details:
   - **Title**: "Test Launch Capsule"
   - **Message**: "This is a test capsule for launch verification"
   - **Delivery Date**: [Set to tomorrow's date]
4. Add recipient:
   - **Name**: Test Recipient
   - **Email**: [your-test-email@domain.com]
5. Upload test media file (image/video)
6. **Verify**: File uploads successfully
7. **Verify**: Preview functionality works
8. Save as draft
9. **Verify**: Capsule appears in "My Capsules" with "Draft" status

---

### Test Scenario 3: Payment Processing

#### Step 5: Subscription Upgrade
1. Navigate to pricing section (/#pricing)
2. Select "Heirloom" plan (or preferred plan)
3. Click "Choose Heirloom" button
4. **Verify**: Redirected to Stripe Checkout
5. Fill in payment details:
   - **Email**: [your-test-email@domain.com]
   - **Card**: [Your real credit card number]
   - **Expiry**: [Real expiry date]
   - **CVC**: [Real CVC code]
   - **Name**: [Real cardholder name]
6. Complete payment
7. **Verify**: Redirected back to success page
8. **Verify**: Subscription status updates in account

#### Step 6: Payment Verification
1. Check Stripe Dashboard → Payments
2. **Verify**: Payment appears as "Succeeded"
3. Check Supabase → Table Editor → profiles
4. **Verify**: User's subscription_status updated to "active"
5. **Verify**: stripe_customer_id and stripe_subscription_id populated

#### Step 6a: Transaction Refund (Post-Test Cleanup)
**IMPORTANT**: Complete this step immediately after confirming the payment test is successful

1. In Stripe Dashboard → Payments, locate the test transaction
2. Click on the payment to open details
3. Click "Refund" button
4. Select "Full refund" 
5. Add refund reason: "Launch testing - full system verification"
6. Confirm the refund
7. **Verify**: Refund shows as "Succeeded" in Stripe
8. **Verify**: Customer receives refund confirmation email
9. **Note**: Refund may take 5-10 business days to appear on customer's statement

**Database Cleanup**: 
- User's subscription_status may remain "active" for testing purposes
- Or manually update to "cancelled" in Supabase if needed for clean test state
---

### Test Scenario 4: Advanced Features Testing

#### Step 7: Sponsor Management (Premium Feature)
1. Navigate to "My Subscription" page
2. Scroll to "Advanced Scheduling" section
3. Add a sponsor email: [another-test-email@domain.com]
4. **Verify**: Sponsor appears in list with "Pending Setup" status
5. **Verify**: Database entry created in sponsors table

#### Step 8: Capsule Finalization
1. Return to "My Capsules"
2. Edit the draft capsule created earlier
3. Complete all required fields
4. Change status from "Draft" to "Ready"
5. **Verify**: Capsule status updates correctly
6. **Verify**: Delivery date can be modified (premium feature)

---

### Test Scenario 5: Contact & Support Systems

#### Step 9: Contact Form Testing
1. Navigate to /contact page
2. Fill out contact form:
   - **Name**: Test User
   - **Email**: [your-test-email@domain.com]
   - **Subject**: Launch Test Message
   - **Message**: Testing contact form for launch readiness
3. Submit form
4. **Verify**: Success message appears
5. **Verify**: Email received at support@mementolocker.com

#### Step 10: Review System Testing
1. Navigate to /leave-review page
2. Submit a test review:
   - **Service**: Time Capsules
   - **Rating**: 5 stars
   - **Comment**: "Test review for launch verification"
3. **Verify**: Review submitted successfully
4. **Verify**: Review appears in database (unverified status)

---

### Test Scenario 6: Email Delivery Testing

#### Step 11: Scheduled Email Verification
*Note: This test requires waiting for the scheduled delivery time*

1. **Immediate Test**: Check if system can process delivery
2. **Database Check**: Verify capsule scheduling in database
3. **Email Service**: Confirm Resend integration is working
4. **Delivery Confirmation**: Wait for scheduled time and verify email delivery

---

## Part 3: Performance & Security Verification

### Performance Checks
- [ ] **Page Load Speed**: All pages load within 3 seconds
- [ ] **Mobile Responsiveness**: Site works correctly on mobile devices
- [ ] **Image Optimization**: Images load efficiently without blocking
- [ ] **JavaScript Errors**: No console errors in browser developer tools

### Security Verification
- [ ] **HTTPS Enforcement**: All traffic redirected to HTTPS
- [ ] **Authentication Flow**: Login/logout works correctly
- [ ] **Data Access**: Users can only access their own data
- [ ] **Payment Security**: Stripe handles all payment data securely

---

## Part 4: Launch Checklist

### Final Pre-Launch Steps
- [ ] **Backup Database**: Create backup of current Supabase data
- [ ] **Monitor Setup**: Ensure error monitoring is configured
- [ ] **Support Ready**: Support email monitored and ready to respond
- [ ] **Documentation**: All test results documented and issues resolved

### Go-Live Verification
- [ ] **DNS Propagation**: Custom domain (if applicable) resolves correctly
- [ ] **SSL Certificate**: HTTPS working without warnings
- [ ] **All Systems Green**: Database, payments, email all operational
- [ ] **Team Notification**: All stakeholders informed of launch status

---

## Emergency Rollback Plan

### If Critical Issues Found:
1. **Immediate**: Revert to previous working deployment in Vercel
2. **Communication**: Notify users of temporary maintenance
3. **Investigation**: Identify and document the issue
4. **Resolution**: Fix issues in development environment
5. **Re-testing**: Complete full test cycle before re-deployment

---

## Post-Launch Monitoring

### First 24 Hours:
- [ ] Monitor error rates and performance metrics
- [ ] Check payment processing success rates
- [ ] Verify email delivery functionality
- [ ] Monitor user registration and authentication
- [ ] Review support email for user issues

### Success Metrics:
- Zero critical errors in first 24 hours
- Payment success rate > 95%
- Email delivery rate > 98%
- Page load times < 3 seconds
- No security vulnerabilities detected

---

*This checklist should be completed by a technical team member with access to all systems. Each checkbox should be verified and signed off before proceeding to launch.*