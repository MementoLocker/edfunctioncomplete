import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.15.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Stripe with secret key
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    })

    // Initialize Supabase client with service role key for admin operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get the raw body and signature
    const body = await req.text()
    const signature = req.headers.get('stripe-signature')

    if (!signature) {
      console.error('Missing stripe-signature header')
      return new Response('Missing stripe-signature header', { 
        status: 400,
        headers: corsHeaders 
      })
    }

    // Verify the webhook signature
    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        Deno.env.get('STRIPE_WEBHOOK_SECRET')!
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return new Response('Webhook signature verification failed', { 
        status: 400,
        headers: corsHeaders 
      })
    }

    console.log('Received verified webhook event:', event.type)

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        await handleSuccessfulPayment(session, supabase)
        break
      
      case 'customer.subscription.updated':
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionUpdate(subscription, supabase)
        break
      
      case 'customer.subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription
        await handleSubscriptionCancellation(deletedSubscription, supabase)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response('Webhook processed successfully', { 
      status: 200,
      headers: corsHeaders 
    })

  } catch (error) {
    console.error('Webhook processing error:', error)
    return new Response('Webhook processing failed', { 
      status: 500,
      headers: corsHeaders 
    })
  }
})

async function handleSuccessfulPayment(session: Stripe.Checkout.Session, supabase: any) {
  try {
    const userId = session.client_reference_id
    if (!userId) {
      console.error('No user ID found in session client_reference_id')
      return
    }

    console.log(`Processing successful payment for user: ${userId}`)

    // Get the price ID from the session to determine the plan type
    let priceId = null;
    if (session.line_items && session.line_items.data && session.line_items.data[0]) {
      priceId = session.line_items.data[0].price?.id;
    }

    // Update user's subscription status in the profiles table
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        stripe_price_id: priceId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating user subscription:', error)
      throw error
    }

    console.log(`Successfully updated subscription for user ${userId}`)
  } catch (error) {
    console.error('Error handling successful payment:', error)
    throw error
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription, supabase: any) {
  try {
    console.log(`Processing subscription update: ${subscription.id}`)

    // Determine subscription status
    let status = 'inactive'
    if (subscription.status === 'active') {
      status = 'active'
    } else if (subscription.status === 'trialing') {
      status = 'trial'
    } else if (subscription.status === 'canceled') {
      status = 'cancelled'
    }

    // Update subscription status based on Stripe subscription ID
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id)

    if (error) {
      console.error('Error updating subscription status:', error)
      throw error
    }

    console.log(`Updated subscription status to ${status} for subscription ${subscription.id}`)
  } catch (error) {
    console.error('Error handling subscription update:', error)
    throw error
  }
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription, supabase: any) {
  try {
    console.log(`Processing subscription cancellation: ${subscription.id}`)

    // Update subscription status to cancelled
    const { error } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'cancelled',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscription.id)

    if (error) {
      console.error('Error updating cancelled subscription:', error)
      throw error
    }

    console.log(`Successfully cancelled subscription ${subscription.id}`)
  } catch (error) {
    console.error('Error handling subscription cancellation:', error)
    throw error
  }
}