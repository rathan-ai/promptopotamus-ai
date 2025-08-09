import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { FEATURE_PRICING } from '@/features/payments/services/payment-constants';

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

    // TODO: Implement pay-as-you-go payment for analysis
    // For now, allow the analysis to proceed
    // In production, this should create a payment intent and process payment
    
    const analysisPrice = FEATURE_PRICING.PROMPT_ANALYSIS;
    
    // Return success (the actual analysis is done client-side for now)
    return NextResponse.json({ 
      success: true,
      message: 'Analysis available',
      price: analysisPrice
    });

  } catch (error) {
    console.error('Error in prompt analysis:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}