import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
});

export async function POST(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { promptId } = await req.json();

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

    // For paid prompts, create Stripe payment intent
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

  } catch (error) {
    console.error('Error processing smart prompt purchase:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Handle successful payment webhook
export async function PUT(req: Request) {
  const supabase = await createServerClient();

  try {
    const { paymentIntentId, status } = await req.json();

    if (status === 'succeeded') {
      // Get payment intent details from Stripe
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
          console.error('Error recording purchase:', purchaseError);
          return NextResponse.json({ error: 'Failed to record purchase' }, { status: 500 });
        }

        // Update download count
        await supabase
          .from('saved_prompts')
          .update({ downloads_count: supabase.sql`downloads_count + 1` })
          .eq('id', parseInt(metadata.prompt_id));

        return NextResponse.json({ success: true, message: 'Purchase recorded successfully' });
      }
    }

    return NextResponse.json({ error: 'Invalid payment status or type' }, { status: 400 });

  } catch (error) {
    console.error('Error handling payment confirmation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}