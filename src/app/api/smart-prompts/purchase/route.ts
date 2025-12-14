import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { paymentAdapter } from '@/lib/payment-adapter';
import { serverPaymentService } from '@/features/payments/services/payment-service';

export async function POST(req: Request) {
  let supabase;
  let user: { id: string; email?: string } | null = null;
  
  try {
    supabase = await createServerClient();
    
    // Get user with more error handling
    let authError: { message?: string } | null = null;
    
    try {
      const authResult = await supabase.auth.getUser();
      user = authResult.data?.user;
      authError = authResult.error;
    } catch (e) {
      // TODO: Consider structured logging for auth errors
      authError = e as { message?: string };
    }

    // TODO: Consider structured logging for auth status monitoring

    if (!user) {
      // TODO: Consider security logging for unauthorized access attempts
      return NextResponse.json({ 
        error: 'Please log in to download Smart Prompts',
        authRequired: true,
        details: authError?.message
      }, { status: 401 });
    }
  } catch (setupError) {
    // TODO: Consider structured logging for setup errors
    return NextResponse.json({ 
      error: 'Authentication setup failed',
      details: setupError instanceof Error ? setupError.message : 'Unknown error'
    }, { status: 500 });
  }

  try {
    const { promptId } = await req.json();

    if (!promptId) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    // TODO: Consider structured logging for purchase attempts

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

    // TODO: Consider structured logging for query results

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
      // TODO: Handle missing marketplace columns gracefully in production
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

      // Update download count - use simple increment
      try {
        // First get current count
        const { data: currentPrompt } = await supabase
          .from('saved_prompts')
          .select('downloads_count')
          .eq('id', promptId)
          .single();
        
        const newCount = (currentPrompt?.downloads_count || 0) + 1;
        
        const { error: updateError } = await supabase
          .from('saved_prompts')
          .update({ downloads_count: newCount })
          .eq('id', promptId);
        
        if (updateError) {
          // TODO: Consider structured logging for download count update failures
        }
      } catch (updateErr) {
        // TODO: Consider structured logging for download count errors
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Free prompt added to your collection!',
        free: true 
      });
    }

    // For paid prompts, redirect to payment flow
    return NextResponse.json({
      error: 'Paid prompts must be purchased using the payment modal.',
      requiresPayment: true,
      promptPrice: prompt.price,
      promptTitle: prompt.title
    }, { status: 400 });

  } catch (error) {
    console.error('Error processing smart prompt purchase:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Legacy payment confirmation endpoint - no longer used
export async function PUT() {
  return NextResponse.json({
    error: 'This endpoint is deprecated. Please use the payment modal for purchases.',
  }, { status: 410 }); // 410 Gone
}