import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { promptId, amount } = await req.json();

    if (!promptId || !amount) {
      return NextResponse.json({ error: 'Prompt ID and amount are required' }, { status: 400 });
    }

    // Validate amount is a positive integer
    if (!Number.isInteger(amount) || amount <= 0) {
      return NextResponse.json({ error: 'Invalid PromptCoin amount' }, { status: 400 });
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
        is_marketplace,
        is_public
      `)
      .eq('id', promptId)
      .single();

    if (promptError || !prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Verify prompt is available for purchase
    if (prompt.is_marketplace === false || prompt.is_public === false) {
      return NextResponse.json({ error: 'Prompt is not available for purchase' }, { status: 404 });
    }

    // Check if user is trying to buy their own prompt
    if (prompt.user_id === user.id) {
      return NextResponse.json({ error: 'You cannot purchase your own prompt' }, { status: 400 });
    }

    // Verify the amount matches the prompt price
    if (prompt.price !== amount) {
      return NextResponse.json({ error: 'Invalid purchase amount' }, { status: 400 });
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

    // Get user's current PromptCoin balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`
        credits_analysis,
        credits_enhancement,
        credits_exam,
        credits_export
      `)
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Failed to fetch user balance' }, { status: 500 });
    }

    const currentBalance = (profile?.credits_analysis || 0) + 
                          (profile?.credits_enhancement || 0) + 
                          (profile?.credits_exam || 0) + 
                          (profile?.credits_export || 0);

    // Check if user has sufficient balance
    if (currentBalance < amount) {
      return NextResponse.json({ 
        error: 'Insufficient PromptCoins',
        required: amount,
        available: currentBalance,
        shortage: amount - currentBalance
      }, { status: 400 });
    }

    // Start transaction to deduct PromptCoins and create purchase record
    const { error: transactionError } = await supabase.rpc('purchase_smart_prompt_with_pc', {
      p_prompt_id: promptId,
      p_buyer_id: user.id,
      p_seller_id: prompt.user_id,
      p_amount: amount
    });

    if (transactionError) {
      console.error('Transaction error:', transactionError);
      
      // Handle specific error cases
      if (transactionError.message?.includes('insufficient')) {
        return NextResponse.json({ error: 'Insufficient PromptCoins' }, { status: 400 });
      }
      
      return NextResponse.json({ error: 'Purchase failed. Please try again.' }, { status: 500 });
    }

    // Update download count
    try {
      const { data: currentPrompt } = await supabase
        .from('saved_prompts')
        .select('downloads_count')
        .eq('id', promptId)
        .single();
      
      const newCount = (currentPrompt?.downloads_count || 0) + 1;
      
      await supabase
        .from('saved_prompts')
        .update({ downloads_count: newCount })
        .eq('id', promptId);
    } catch (updateErr) {
      console.warn('Download count update failed:', updateErr);
    }

    // Log the transaction for audit purposes
    try {
      await supabase
        .from('promptcoin_transactions')
        .insert({
          user_id: user.id,
          transaction_type: 'purchase',
          amount: -amount, // Negative for expense
          description: `Smart Prompt Purchase: ${prompt.title}`,
          reference_id: promptId.toString(),
          reference_type: 'smart_prompt_purchase'
        });
    } catch (logError) {
      console.warn('Failed to log transaction:', logError);
    }

    return NextResponse.json({ 
      success: true,
      message: 'Smart Prompt purchased successfully!',
      prompt: {
        id: prompt.id,
        title: prompt.title
      },
      amount_charged: amount
    });

  } catch (error) {
    console.error('Error in PromptCoin purchase:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}