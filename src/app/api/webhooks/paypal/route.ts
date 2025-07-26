import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import crypto from 'crypto';

// Get PayPal configuration only when needed
const getPayPalConfig = () => {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const environment = process.env.PAYPAL_ENVIRONMENT || 'sandbox';

  if (!webhookId || !clientId || !clientSecret) {
    throw new Error('PayPal configuration is incomplete. Missing PAYPAL_WEBHOOK_ID, PAYPAL_CLIENT_ID, or PAYPAL_CLIENT_SECRET');
  }

  return { webhookId, clientId, clientSecret, environment };
};

// Idempotency cache for webhook events
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

async function verifyPayPalWebhook(
  headers: Headers,
  body: string,
  webhookEvent: any
): Promise<boolean> {
  try {
    const authAlgo = headers.get('paypal-auth-algo');
    const transmission_id = headers.get('paypal-transmission-id');
    const cert_id = headers.get('paypal-cert-id');
    const transmission_sig = headers.get('paypal-transmission-sig');
    const transmission_time = headers.get('paypal-transmission-time');

    if (!authAlgo || !transmission_id || !cert_id || !transmission_sig || !transmission_time) {
      return false;
    }

    // Get PayPal configuration
    const { webhookId, environment } = getPayPalConfig();

    // Get PayPal access token
    const tokenResponse = await getPayPalAccessToken();
    if (!tokenResponse.success) {
      return false;
    }

    const baseUrl = environment === 'live' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';

    // Verify webhook signature with PayPal
    const verifyResponse = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenResponse.accessToken}`,
      },
      body: JSON.stringify({
        auth_algo: authAlgo,
        cert_id: cert_id,
        transmission_id: transmission_id,
        transmission_sig: transmission_sig,
        transmission_time: transmission_time,
        webhook_id: webhookId,
        webhook_event: webhookEvent
      })
    });

    const verifyData = await verifyResponse.json();
    return verifyResponse.ok && verifyData.verification_status === 'SUCCESS';

  } catch (error) {
    console.error('PayPal webhook verification error:', error);
    return false;
  }
}

async function getPayPalAccessToken(): Promise<{ success: boolean; accessToken?: string }> {
  try {
    // Get PayPal configuration
    const { clientId, clientSecret, environment } = getPayPalConfig();
    
    const baseUrl = environment === 'live' 
      ? 'https://api-m.paypal.com' 
      : 'https://api-m.sandbox.paypal.com';

    const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials'
    });

    const data = await response.json();
    
    if (!response.ok) {
      return { success: false };
    }

    return { success: true, accessToken: data.access_token };

  } catch (error) {
    console.error('PayPal token request error:', error);
    return { success: false };
  }
}

export async function POST(req: Request) {
  const supabase = await createServerClient();
  const body = await req.text();
  const headersList = await headers();

  let webhookEvent;
  try {
    webhookEvent = JSON.parse(body);
  } catch (error) {
    await supabase.rpc('log_payment_security_event', {
      p_event_type: 'paypal_webhook_invalid_json',
      p_severity: 'high',
      p_error_message: 'PayPal webhook received with invalid JSON'
    });
    
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  // Verify webhook signature
  const isValid = await verifyPayPalWebhook(headersList, body, webhookEvent);
  if (!isValid) {
    await supabase.rpc('log_payment_security_event', {
      p_event_type: 'paypal_webhook_signature_invalid',
      p_severity: 'critical',
      p_error_message: 'PayPal webhook signature verification failed'
    });
    
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const eventId = webhookEvent.id;
  
  // Check for duplicate events using idempotency
  if (isEventProcessed(eventId)) {
    console.log(`Duplicate PayPal event ${eventId} ignored`);
    return NextResponse.json({ status: 'duplicate_ignored' });
  }

  try {
    // Log webhook event for security monitoring
    await supabase.rpc('log_payment_security_event', {
      p_event_type: 'paypal_webhook_received',
      p_severity: 'low',
      p_request_data: { 
        event_type: webhookEvent.event_type, 
        event_id: eventId,
        resource_id: webhookEvent.resource?.id
      }
    });

    // Handle the event
    switch (webhookEvent.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        await handlePaymentCaptureCompleted(webhookEvent.resource, supabase);
        break;
      }
      
      case 'PAYMENT.CAPTURE.DENIED': {
        await handlePaymentCaptureDenied(webhookEvent.resource, supabase);
        break;
      }
      
      case 'PAYMENT.CAPTURE.REFUNDED': {
        await handlePaymentCaptureRefunded(webhookEvent.resource, supabase);
        break;
      }
      
      case 'CHECKOUT.ORDER.APPROVED': {
        await handleOrderApproved(webhookEvent.resource, supabase);
        break;
      }

      default:
        console.log(`Unhandled PayPal event type: ${webhookEvent.event_type}`);
    }

    // Mark event as successfully processed
    markEventProcessed(eventId, 'success');

    return NextResponse.json({ status: 'success', event_id: eventId });

  } catch (error) {
    console.error('Error processing PayPal webhook:', error);
    
    // Log critical error
    await supabase.rpc('log_payment_security_event', {
      p_event_type: 'paypal_webhook_processing_error',
      p_severity: 'critical',
      p_error_message: error instanceof Error ? error.message : 'Unknown webhook processing error',
      p_request_data: { event_type: webhookEvent.event_type, event_id: eventId }
    });
    
    // Mark event as failed
    markEventProcessed(eventId, 'failed');
    
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}

async function handlePaymentCaptureCompleted(resource: any, supabase: any) {
  const customId = resource.custom_id; // This contains user_id
  const orderId = resource.supplementary_data?.related_ids?.order_id;
  
  if (!customId) {
    throw new Error('Missing custom_id (user_id) in payment capture');
  }

  // Find the purchase record by PayPal order ID
  const { data: purchase, error: purchaseError } = await supabase
    .from('smart_prompt_purchases')
    .select('*')
    .eq('paypal_order_id', orderId)
    .single();

  if (purchaseError || !purchase) {
    throw new Error(`Purchase record not found for PayPal order ${orderId}`);
  }

  // Update purchase status
  const { error: updateError } = await supabase
    .from('smart_prompt_purchases')
    .update({ 
      transaction_id: resource.id,
      payment_provider: 'paypal'
    })
    .eq('id', purchase.id);

  if (updateError) {
    throw new Error(`Failed to update purchase record: ${updateError.message}`);
  }

  // Log successful payment
  await supabase.rpc('log_payment_security_event', {
    p_user_id: customId,
    p_event_type: 'paypal_payment_success',
    p_severity: 'low',
    p_response_data: { 
      capture_id: resource.id,
      order_id: orderId,
      amount: resource.amount.value,
      currency: resource.amount.currency_code
    }
  });
}

async function handlePaymentCaptureDenied(resource: any, supabase: any) {
  const customId = resource.custom_id;
  
  await supabase.rpc('log_payment_security_event', {
    p_user_id: customId,
    p_event_type: 'paypal_payment_denied',
    p_severity: 'medium',
    p_error_message: `PayPal payment capture denied`,
    p_request_data: { 
      capture_id: resource.id,
      amount: resource.amount?.value,
      status_details: resource.status_details
    }
  });
}

async function handlePaymentCaptureRefunded(resource: any, supabase: any) {
  const customId = resource.custom_id;
  
  await supabase.rpc('log_payment_security_event', {
    p_user_id: customId,
    p_event_type: 'paypal_payment_refunded',
    p_severity: 'medium',
    p_request_data: { 
      capture_id: resource.id,
      refund_amount: resource.amount?.value,
      refund_id: resource.id
    }
  });
}

async function handleOrderApproved(resource: any, supabase: any) {
  const customId = resource.purchase_units?.[0]?.custom_id;
  
  await supabase.rpc('log_payment_security_event', {
    p_user_id: customId,
    p_event_type: 'paypal_order_approved',
    p_severity: 'low',
    p_request_data: { 
      order_id: resource.id,
      amount: resource.purchase_units?.[0]?.amount?.value
    }
  });
}