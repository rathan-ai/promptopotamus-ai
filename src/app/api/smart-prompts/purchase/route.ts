import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Client, CheckoutPaymentIntent, OrderRequest, Environment } from '@paypal/paypal-server-sdk';

const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    })
  : null;

// Initialize PayPal client
const paypalClient = process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET
  ? new Client({
      clientCredentialsAuthCredentials: {
        oAuthClientId: process.env.PAYPAL_CLIENT_ID,
        oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET,
      },
      environment: process.env.NODE_ENV === 'production' 
        ? Environment.Live 
        : Environment.Sandbox,
    })
  : null;

export async function POST(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { promptId, paymentProvider = 'stripe' } = await req.json();

    if (!promptId) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    // Get prompt details
    const { data: prompt, error: promptError } = await supabase
      .from('saved_prompts')
      .select(`
        id,
        title,
        description,
        price,
        user_id,
        profiles!saved_prompts_user_id_fkey(full_name)
      `)
      .eq('id', promptId)
      .eq('is_marketplace', true)
      .eq('is_public', true)
      .single();

    if (promptError || !prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Check if user is trying to buy their own prompt
    if (prompt.user_id === user.id) {
      return NextResponse.json({ error: 'You cannot purchase your own prompt' }, { status: 400 });
    }

    // Check if user has already purchased this prompt
    const { data: existingPurchase } = await supabase
      .from('smart_prompt_purchases')
      .select('id')
      .eq('prompt_id', promptId)
      .eq('buyer_id', user.id)
      .single();

    if (existingPurchase) {
      return NextResponse.json({ error: 'You have already purchased this prompt' }, { status: 400 });
    }

    // If prompt is free, create purchase record directly
    if (!prompt.price || prompt.price === 0) {
      const { error: purchaseError } = await supabase
        .from('smart_prompt_purchases')
        .insert({
          prompt_id: promptId,
          buyer_id: user.id,
          seller_id: prompt.user_id,
          purchase_price: 0,
          purchased_at: new Date().toISOString()
        });

      if (purchaseError) {
        return NextResponse.json({ error: 'Failed to record free purchase' }, { status: 500 });
      }

      // Update download count
      await supabase
        .from('saved_prompts')
        .update({ downloads_count: supabase.sql`downloads_count + 1` })
        .eq('id', promptId);

      return NextResponse.json({ 
        success: true, 
        message: 'Free prompt added to your collection!',
        free: true 
      });
    }

    // For paid prompts, create payment based on provider
    if (paymentProvider === 'paypal') {
      if (!paypalClient) {
        return NextResponse.json({ 
          error: 'PayPal payment processing is not configured. Please contact support.' 
        }, { status: 500 });
      }

      const orderRequest: OrderRequest = {
        intent: CheckoutPaymentIntent.Capture,
        purchaseUnits: [{
          amount: {
            currencyCode: 'USD',
            value: prompt.price.toFixed(2),
          },
          description: `Smart Prompt: ${prompt.title}`,
          customId: `smart_prompt_${promptId}_${user.id}`,
        }],
        applicationContext: {
          brandName: 'Promptopotamus',
          userAction: 'PAY_NOW',
        },
      };

      try {
        const response = await paypalClient.ordersController.ordersCreate({
          body: orderRequest,
          prefer: 'return=representation',
        });

        if (response.statusCode !== 201 || !response.result.id) {
          return NextResponse.json({ 
            error: 'Failed to create PayPal order' 
          }, { status: 500 });
        }

        return NextResponse.json({
          success: true,
          paypalOrderId: response.result.id,
          amount: prompt.price,
          promptTitle: prompt.title,
          sellerName: prompt.profiles?.full_name || 'Unknown Creator'
        });
      } catch (error) {
        console.error('PayPal order creation error:', error);
        return NextResponse.json({ 
          error: 'Failed to create PayPal payment' 
        }, { status: 500 });
      }
    } else {
      // Stripe payment (legacy)
      if (!stripe) {
        return NextResponse.json({ 
          error: 'Stripe payment processing is not configured. Please contact support.' 
        }, { status: 500 });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(prompt.price * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          type: 'smart_prompt_purchase',
          prompt_id: promptId.toString(),
          buyer_id: user.id,
          seller_id: prompt.user_id,
          prompt_title: prompt.title,
        },
        description: `Purchase of Smart Prompt: ${prompt.title}`,
      });

      return NextResponse.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        amount: prompt.price,
        promptTitle: prompt.title,
        sellerName: prompt.profiles?.full_name || 'Unknown Creator'
      });
    }

  } catch (error) {
    console.error('Error processing smart prompt purchase:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle successful payment confirmation
export async function PUT(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { paymentIntentId, status, paypalOrderId, paymentProvider = 'stripe' } = await req.json();

    if (paymentProvider === 'paypal' && paypalOrderId && status === 'approved') {
      if (!paypalClient) {
        return NextResponse.json({ 
          error: 'PayPal payment processing is not configured' 
        }, { status: 500 });
      }

      try {
        // Capture the PayPal payment
        const captureResponse = await paypalClient.ordersController.ordersCapture({
          id: paypalOrderId,
          prefer: 'return=representation',
        });

        if (captureResponse.statusCode === 201 && captureResponse.result.status === 'COMPLETED') {
          const orderDetails = captureResponse.result;
          const purchaseUnit = orderDetails.purchaseUnits?.[0];
          const customId = purchaseUnit?.customId || '';
          
          // Parse custom ID to get prompt and user info
          const [, promptIdStr, buyerId] = customId.split('_');
          const promptId = parseInt(promptIdStr);
          
          if (!promptId || buyerId !== user.id) {
            return NextResponse.json({ error: 'Invalid purchase data' }, { status: 400 });
          }

          // Get prompt details for seller ID
          const { data: prompt } = await supabase
            .from('saved_prompts')
            .select('user_id')
            .eq('id', promptId)
            .single();

          if (!prompt) {
            return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
          }

          // Create purchase record
          const { error: purchaseError } = await supabase
            .from('smart_prompt_purchases')
            .insert({
              prompt_id: promptId,
              buyer_id: user.id,
              seller_id: prompt.user_id,
              purchase_price: parseFloat(purchaseUnit?.amount?.value || '0'),
              paypal_order_id: paypalOrderId,
              purchased_at: new Date().toISOString()
            });

          if (purchaseError) {
            console.error('Error recording PayPal purchase:', purchaseError);
            return NextResponse.json({ error: 'Failed to record purchase' }, { status: 500 });
          }

          // Update download count
          await supabase
            .from('saved_prompts')
            .update({ downloads_count: supabase.sql`downloads_count + 1` })
            .eq('id', promptId);

          return NextResponse.json({ success: true, message: 'PayPal purchase completed successfully' });
        } else {
          return NextResponse.json({ error: 'PayPal payment capture failed' }, { status: 400 });
        }
      } catch (error) {
        console.error('PayPal capture error:', error);
        return NextResponse.json({ error: 'Failed to capture PayPal payment' }, { status: 500 });
      }
    } else if (paymentProvider === 'stripe' && paymentIntentId && status === 'succeeded') {
      // Handle Stripe payment (legacy)
      if (!stripe) {
        return NextResponse.json({ 
          error: 'Stripe payment processing is not configured' 
        }, { status: 500 });
      }

      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      const metadata = paymentIntent.metadata;

      if (metadata.type === 'smart_prompt_purchase') {
        // Create purchase record
        const { error: purchaseError } = await supabase
          .from('smart_prompt_purchases')
          .insert({
            prompt_id: parseInt(metadata.prompt_id),
            buyer_id: metadata.buyer_id,
            seller_id: metadata.seller_id,
            purchase_price: paymentIntent.amount / 100, // Convert back to dollars
            stripe_payment_intent_id: paymentIntentId,
            purchased_at: new Date().toISOString()
          });

        if (purchaseError) {
          console.error('Error recording Stripe purchase:', purchaseError);
          return NextResponse.json({ error: 'Failed to record purchase' }, { status: 500 });
        }

        // Update download count
        await supabase
          .from('saved_prompts')
          .update({ downloads_count: supabase.sql`downloads_count + 1` })
          .eq('id', parseInt(metadata.prompt_id));

        return NextResponse.json({ success: true, message: 'Stripe purchase recorded successfully' });
      }
    }

    return NextResponse.json({ error: 'Invalid payment status, provider, or data' }, { status: 400 });

  } catch (error) {
    console.error('Error handling payment confirmation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}