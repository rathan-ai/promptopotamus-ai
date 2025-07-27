import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { paymentAdapter } from '@/lib/payment-adapter';

export async function POST(req: Request) {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  console.log('Smart Prompts Purchase - Auth check:', { 
    hasUser: !!user, 
    userId: user?.id,
    authError: authError?.message 
  });

  if (!user) {
    console.error('Smart Prompts Purchase - Unauthorized access attempt');
    return NextResponse.json({ 
      error: 'Please log in to download Smart Prompts',
      authRequired: true 
    }, { status: 401 });
  }

  try {
    const { promptId } = await req.json();

    if (!promptId) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    console.log('Smart Prompts Purchase - Looking for prompt ID:', promptId);

    // Get prompt details - simplified query without problematic columns/joins
    const { data: prompt, error: promptError } = await supabase
      .from('saved_prompts')
      .select(`
        id,
        title,
        description,
        price,
        user_id
      `)
      .eq('id', promptId)
      .single();

    console.log('Smart Prompts Purchase - Query result:', { 
      found: !!prompt, 
      error: promptError?.message 
    });

    if (promptError || !prompt) {
      console.error('Prompt not found:', { promptId, error: promptError });
      return NextResponse.json({ 
        error: 'Prompt not found',
        details: promptError?.message 
      }, { status: 404 });
    }

    // Additional checks for marketplace prompts if columns exist
    try {
      const { data: marketplaceCheck } = await supabase
        .from('saved_prompts')
        .select('is_marketplace, is_public')
        .eq('id', promptId)
        .single();
      
      if (marketplaceCheck?.is_marketplace === false || marketplaceCheck?.is_public === false) {
        return NextResponse.json({ error: 'Prompt is not available for purchase' }, { status: 404 });
      }
    } catch (e) {
      console.warn('Marketplace column check failed, proceeding without it:', e);
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

    // For paid prompts, use the universal payment adapter
    try {
      const paymentResponse = await paymentAdapter.createPayment({
        amount: prompt.price,
        currency: 'USD',
        description: `Smart Prompt: ${prompt.title}`,
        userId: user.id,
        metadata: {
          type: 'smart_prompt_purchase',
          prompt_id: promptId.toString(),
          buyer_id: user.id,
          seller_id: prompt.user_id,
          prompt_title: prompt.title,
          returnUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/smart-prompts/purchase-success`,
          cancelUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/smart-prompts/purchase-cancelled`,
          orderId: `smart_prompt_${promptId}_${user.id}`
        }
      });

      if (!paymentResponse.success) {
        return NextResponse.json({ 
          error: paymentResponse.error || 'Failed to create payment' 
        }, { status: 500 });
      }

      // Get active payment provider for response
      const activeProvider = await paymentAdapter.getActiveProvider();

      return NextResponse.json({
        success: true,
        transactionId: paymentResponse.transactionId,
        clientSecret: paymentResponse.clientSecret,
        redirectUrl: paymentResponse.redirectUrl,
        amount: prompt.price,
        promptTitle: prompt.title,
        sellerName: 'Creator', // Simplified since we removed the profile join
        paymentProvider: activeProvider?.id || 'unknown'
      });

    } catch (error) {
      console.error('Payment creation error:', error);
      return NextResponse.json({ 
        error: 'Failed to create payment. Please try again or contact support.' 
      }, { status: 500 });
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
    const { transactionId, paymentMethodId } = await req.json();

    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 });
    }

    try {
      // Use universal payment adapter to confirm the payment
      const confirmResponse = await paymentAdapter.confirmPayment(transactionId, paymentMethodId);

      if (!confirmResponse.success) {
        return NextResponse.json({ 
          error: confirmResponse.error || 'Payment confirmation failed' 
        }, { status: 400 });
      }

      // Get payment details to extract metadata
      const statusResponse = await paymentAdapter.getPaymentStatus(transactionId);
      
      if (statusResponse.status === 'error') {
        return NextResponse.json({ error: 'Failed to get payment details' }, { status: 500 });
      }

      // Parse the metadata from the payment details
      let promptId: number;
      let buyerId: string;
      let sellerId: string;
      let purchasePrice: number;

      // Extract metadata from payment details (varies by provider)
      const details = statusResponse.details;
      const activeProvider = await paymentAdapter.getActiveProvider();

      if (activeProvider?.id === 'paypal') {
        // PayPal: extract from custom_id
        const customId = details?.purchase_units?.[0]?.custom_id || '';
        const [, promptIdStr, userIdFromCustom] = customId.split('_');
        promptId = parseInt(promptIdStr);
        buyerId = userIdFromCustom;
        purchasePrice = parseFloat(details?.purchase_units?.[0]?.amount?.value || '0');
      } else if (activeProvider?.id === 'stripe') {
        // Stripe: extract from metadata
        const metadata = details?.metadata || {};
        promptId = parseInt(metadata.prompt_id);
        buyerId = metadata.buyer_id;
        sellerId = metadata.seller_id;
        purchasePrice = details?.amount ? details.amount / 100 : 0; // Convert from cents
      } else {
        // Custom API: expect consistent metadata format
        const metadata = details?.metadata || details;
        promptId = parseInt(metadata.prompt_id);
        buyerId = metadata.buyer_id;
        sellerId = metadata.seller_id;
        purchasePrice = parseFloat(metadata.amount || details?.amount || '0');
      }

      // Validate extracted data
      if (!promptId || buyerId !== user.id) {
        return NextResponse.json({ error: 'Invalid payment metadata' }, { status: 400 });
      }

      // Get prompt details if seller ID not available
      if (!sellerId) {
        const { data: prompt } = await supabase
          .from('saved_prompts')
          .select('user_id, price')
          .eq('id', promptId)
          .single();

        if (!prompt) {
          return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
        }

        sellerId = prompt.user_id;
        if (!purchasePrice) {
          purchasePrice = prompt.price;
        }
      }

      // Create purchase record
      const { error: purchaseError } = await supabase
        .from('smart_prompt_purchases')
        .insert({
          prompt_id: promptId,
          buyer_id: user.id,
          seller_id: sellerId,
          purchase_price: purchasePrice,
          transaction_id: confirmResponse.transactionId || transactionId,
          payment_provider: activeProvider?.id || 'unknown',
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
        .eq('id', promptId);

      return NextResponse.json({ 
        success: true, 
        message: `Purchase completed successfully via ${activeProvider?.name || 'payment provider'}` 
      });

    } catch (error) {
      console.error('Payment confirmation error:', error);
      return NextResponse.json({ 
        error: 'Failed to confirm payment. Please contact support if you were charged.' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error handling payment confirmation:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}