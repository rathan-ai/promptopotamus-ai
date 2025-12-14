import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';

// Initialize Stripe only if the secret key is available
const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  return new Stripe(secretKey, {
    apiVersion: '2025-06-30.basil'
  });
};

const getEndpointSecret = () => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }
  return secret;
};

import { isEventProcessed, markEventProcessed } from '@/lib/webhooks/idempotency';

export async function POST(req: Request) {
  const supabase = await createServerClient();
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    // Log security event for missing signature
    await supabase.rpc('log_payment_security_event', {
      p_event_type: 'webhook_missing_signature',
      p_severity: 'high',
      p_error_message: 'Stripe webhook received without signature'
    });
    
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    // Get Stripe instance and endpoint secret
    const stripe = getStripe();
    const endpointSecret = getEndpointSecret();
    
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err) {
    const error = err as Error;
    
    // Log security event for signature verification failure
    await supabase.rpc('log_payment_security_event', {
      p_event_type: 'webhook_signature_invalid',
      p_severity: 'critical',
      p_error_message: `Stripe webhook signature verification failed: ${error.message}`
    });
    
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Check for duplicate/replay events using idempotency
  if (isEventProcessed(event.id)) {
    // TODO: Consider adding structured logging for duplicate events in production
    return NextResponse.json({ status: 'duplicate_ignored' });
  }

  try {
    // Log webhook event for security monitoring
    await supabase.rpc('log_payment_security_event', {
      p_event_type: 'webhook_received',
      p_severity: 'low',
      p_request_data: { 
        event_type: event.type, 
        event_id: event.id,
        object_id: (event.data.object as any).id
      }
    });

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent, supabase);
        break;
      }
      
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailure(paymentIntent, supabase);
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSuccess(invoice, supabase);
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription, supabase);
        break;
      }
      
      case 'charge.dispute.created': {
        const dispute = event.data.object as Stripe.Dispute;
        await handleDisputeCreated(dispute, supabase);
        break;
      }

      default:
        // TODO: Consider logging unhandled event types to monitoring system
        break;
    }

    // Mark event as successfully processed
    markEventProcessed(event.id, 'success');

    return NextResponse.json({ status: 'success', event_id: event.id });

  } catch (error) {
    console.error('Error processing Stripe webhook:', error);
    
    // Log critical error
    await supabase.rpc('log_payment_security_event', {
      p_event_type: 'webhook_processing_error',
      p_severity: 'critical',
      p_error_message: error instanceof Error ? error.message : 'Unknown webhook processing error',
      p_request_data: { event_type: event.type, event_id: event.id }
    });
    
    // Mark event as failed
    markEventProcessed(event.id, 'failed');
    
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent, supabase: unknown) {
  const db = supabase as any;
  const userId = paymentIntent.metadata?.user_id;
  const promptId = paymentIntent.metadata?.prompt_id;
  const purchaseType = paymentIntent.metadata?.purchase_type || 'smart_prompt';

  if (!userId) {
    throw new Error('Missing user_id metadata');
  }

  // Handle smart prompt purchases
  if (purchaseType === 'smart_prompt' && promptId) {
    // Create purchase record
    const { error: purchaseError } = await db
      .from('smart_prompt_purchases')
      .insert({
        prompt_id: promptId,
        buyer_id: userId,
        amount_paid: paymentIntent.amount / 100, // Convert from cents to dollars
        payment_provider: 'stripe',
        transaction_id: paymentIntent.id
      });

    if (purchaseError) {
      throw new Error(`Failed to record smart prompt purchase: ${purchaseError.message}`);
    }

    // Update download count
    await db.rpc('increment_download_count', { p_prompt_id: promptId });
  }

  // Log successful payment
  await db.rpc('log_payment_security_event', {
    p_user_id: userId,
    p_event_type: 'stripe_payment_success',
    p_severity: 'low',
    p_response_data: {
      payment_intent_id: paymentIntent.id,
      purchase_type: purchaseType,
      prompt_id: promptId,
      amount: paymentIntent.amount / 100
    }
  });
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent, supabase: unknown) {
  const db = supabase as any;
  const userId = paymentIntent.metadata?.user_id;
  
  await db.rpc('log_payment_security_event', {
    p_user_id: userId,
    p_event_type: 'stripe_payment_failed',
    p_severity: 'medium',
    p_error_message: `Payment failed: ${paymentIntent.last_payment_error?.message}`,
    p_request_data: { 
      payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      failure_code: paymentIntent.last_payment_error?.code
    }
  });
}

async function handleInvoicePaymentSuccess(invoice: Stripe.Invoice, supabase: unknown) {
  // Handle subscription-based payments if needed
  // TODO: Implement invoice payment handling logic
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: unknown) {
  const db = supabase as any;
  const userId = subscription.metadata?.user_id;
  
  if (userId) {
    // Update user payment status
    await db
      .from('profiles')
      .update({ payment_status: 'cancelled' })
      .eq('id', userId);
      
    await db.rpc('log_payment_security_event', {
      p_user_id: userId,
      p_event_type: 'subscription_cancelled',
      p_severity: 'low',
      p_request_data: { subscription_id: subscription.id }
    });
  }
}

async function handleDisputeCreated(dispute: Stripe.Dispute, supabase: unknown) {
  const db = supabase as any;
  // Handle chargebacks/disputes
  await db.rpc('log_payment_security_event', {
    p_event_type: 'stripe_dispute_created',
    p_severity: 'high',
    p_error_message: `Dispute created for charge ${dispute.charge}`,
    p_request_data: { 
      dispute_id: dispute.id,
      charge_id: dispute.charge,
      amount: dispute.amount / 100,
      reason: dispute.reason
    }
  });
}