import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { paymentAdapter } from '@/lib/payment-adapter';

export async function POST(req: Request) {
  let supabase;
  let user: any = null;
  
  try {
    supabase = await createServerClient();
    
    // Get user with more error handling
    let authError: any = null;
    
    try {
      const authResult = await supabase.auth.getUser();
      user = authResult.data?.user;
      authError = authResult.error;
    } catch (e) {
      console.error('Smart Prompts Purchase - Auth error:', e);
      authError = e;
    }

    console.log('Smart Prompts Purchase - Auth check:', { 
      hasUser: !!user, 
      userId: user?.id,
      authError: authError?.message,
      fullAuthError: authError
    });

    if (!user) {
      console.error('Smart Prompts Purchase - Unauthorized access attempt:', authError);
      return NextResponse.json({ 
        error: 'Please log in to download Smart Prompts',
        authRequired: true,
        details: authError?.message
      }, { status: 401 });
    }
  } catch (setupError) {
    console.error('Smart Prompts Purchase - Setup error:', setupError);
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
          console.warn('Failed to update download count:', updateError);
        }
      } catch (updateErr) {
        console.warn('Download count update failed:', updateErr);
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Free prompt added to your collection!',
        free: true 
      });
    }

    // For paid prompts, redirect to PromptCoin purchase flow
    return NextResponse.json({ 
      error: 'Paid prompts must be purchased using PromptCoins. Please use the purchase modal.',
      requiresPromptCoins: true,
      promptPrice: prompt.price,
      promptTitle: prompt.title
    }, { status: 400 });

  } catch (error) {
    console.error('Error processing smart prompt purchase:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Legacy payment confirmation endpoint - no longer used
// All Smart Prompt purchases now use PromptCoins via /purchase-with-pc
export async function PUT(req: Request) {
  return NextResponse.json({ 
    error: 'This endpoint is deprecated. All Smart Prompt purchases now use PromptCoins.',
    redirectTo: '/api/smart-prompts/purchase-with-pc'
  }, { status: 410 }); // 410 Gone
}