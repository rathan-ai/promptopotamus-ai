import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { PROMPTCOIN_COSTS } from '@/lib/promptcoin-utils';

export async function POST(req: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Check user's PromptCoin balance
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
      return NextResponse.json({ error: 'Failed to check balance' }, { status: 500 });
    }

    const currentBalance = (profile?.credits_analysis || 0) + 
                          (profile?.credits_enhancement || 0) + 
                          (profile?.credits_exam || 0) + 
                          (profile?.credits_export || 0);

    // Check if user has sufficient PromptCoins
    if (currentBalance < PROMPTCOIN_COSTS.analysis) {
      return NextResponse.json({ 
        error: `Insufficient PromptCoins. You need ${PROMPTCOIN_COSTS.analysis} PC for analysis.`,
        required: PROMPTCOIN_COSTS.analysis,
        available: currentBalance,
        shortage: PROMPTCOIN_COSTS.analysis - currentBalance
      }, { status: 400 });
    }

    // Deduct PromptCoins for analysis
    const { error: deductError } = await supabase.rpc('deduct_promptcoins_for_feature', {
      p_user_id: user.id,
      p_amount: PROMPTCOIN_COSTS.analysis,
      p_feature: 'analysis',
      p_description: 'Prompt Analysis'
    });

    if (deductError) {
      console.error('Failed to deduct PromptCoins:', deductError);
      return NextResponse.json({ error: 'Failed to process payment' }, { status: 500 });
    }

    // Return success (the actual analysis is done client-side for now)
    return NextResponse.json({ 
      success: true,
      message: 'Analysis payment processed successfully',
      charged: PROMPTCOIN_COSTS.analysis
    });

  } catch (error) {
    console.error('Error in prompt analysis:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}