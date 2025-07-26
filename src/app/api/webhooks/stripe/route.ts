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
    apiVersion: '2024-11-20.acacia'
  });
};

const getEndpointSecret = () => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }
  return secret;
};

// Idempotency cache for webhook events (use Redis in production)
const processedEvents = new Map<string, { timestamp: number; status: string }>();
const IDEMPOTENCY_TTL = 24 * 60 * 60 * 1000; // 24 hours

function cleanIdempotencyCache() {
  const now = Date.now();
  for (const [eventId, data] of processedEvents.entries()) {
    if (now - data.timestamp > IDEMPOTENCY_TTL) {
      processedEvents.delete(eventId);
    }
  }
}

function isEventProcessed(eventId: string): boolean {
  cleanIdempotencyCache();
  return processedEvents.has(eventId);
}

function markEventProcessed(eventId: string, status: string): void {
  processedEvents.set(eventId, {
    timestamp: Date.now(),
    status
  });
}

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
    console.log(`Duplicate Stripe event ${event.id} ignored`);
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
        object_id: event.data.object.id
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
        console.log(`Unhandled Stripe event type: ${event.type}`);
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

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  const userId = paymentIntent.metadata?.user_id;
  const promptCoinsData = paymentIntent.metadata?.promptcoins;
  
  if (!userId || !promptCoinsData) {
    throw new Error('Missing user_id or promptcoins metadata');
  }

  const promptCoins = JSON.parse(promptCoinsData);
  
  // Log PromptCoin credit transaction
  await supabase.rpc('log_promptcoin_transaction', {
    p_user_id: userId,
    p_amount: Object.values(promptCoins).reduce((sum: number, val: number) => sum + val, 0),
    p_transaction_type: 'purchase',
    p_reference_type: 'stripe_payment',
    p_reference_id: paymentIntent.id,
    p_description: `PromptCoins purchased via Stripe payment ${paymentIntent.id}`,
    p_metadata: { stripe_payment_intent_id: paymentIntent.id }
  });

  // Credit the user's account
  const updateData: any = {};
  if (promptCoins.analysis) updateData.credits_analysis = supabase.rpc('coalesce', [supabase.raw('credits_analysis'), 0]) + promptCoins.analysis;
  if (promptCoins.enhancement) updateData.credits_enhancement = supabase.rpc('coalesce', [supabase.raw('credits_enhancement'), 0]) + promptCoins.enhancement;
  if (promptCoins.exam) updateData.credits_exam = supabase.rpc('coalesce', [supabase.raw('credits_exam'), 0]) + promptCoins.exam;
  if (promptCoins.export) updateData.credits_export = supabase.rpc('coalesce', [supabase.raw('credits_export'), 0]) + promptCoins.export;

  const { error } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', userId);

  if (error) {
    throw new Error(`Failed to update user credits: ${error.message}`);
  }

  // Log successful credit
  await supabase.rpc('log_payment_security_event', {
    p_user_id: userId,
    p_event_type: 'stripe_payment_success',
    p_severity: 'low',
    p_response_data: { 
      payment_intent_id: paymentIntent.id,
      promptcoins_credited: promptCoins,
      amount: paymentIntent.amount / 100
    }
  });
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent, supabase: any) {
  const userId = paymentIntent.metadata?.user_id;
  
  await supabase.rpc('log_payment_security_event', {
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

async function handleInvoicePaymentSuccess(invoice: Stripe.Invoice, supabase: any) {
  // Handle subscription-based payments if needed
  console.log('Invoice payment succeeded:', invoice.id);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, supabase: any) {
  const userId = subscription.metadata?.user_id;
  
  if (userId) {
    // Update user payment status
    await supabase
      .from('profiles')
      .update({ payment_status: 'cancelled' })
      .eq('id', userId);
      
    await supabase.rpc('log_payment_security_event', {
      p_user_id: userId,
      p_event_type: 'subscription_cancelled',
      p_severity: 'low',
      p_request_data: { subscription_id: subscription.id }
    });
  }
}

async function handleDisputeCreated(dispute: Stripe.Dispute, supabase: any) {
  // Handle chargebacks/disputes
  await supabase.rpc('log_payment_security_event', {
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