import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's PromptCoin balance from profile
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
      console.error('Error fetching user balance:', profileError);
      return NextResponse.json({ error: 'Failed to fetch balance' }, { status: 500 });
    }

    // Calculate total PromptCoins
    const credits_analysis = profile?.credits_analysis || 0;
    const credits_enhancement = profile?.credits_enhancement || 0;
    const credits_exam = profile?.credits_exam || 0;
    const credits_export = profile?.credits_export || 0;
    
    const total = credits_analysis + credits_enhancement + credits_exam + credits_export;

    return NextResponse.json({
      total,
      credits_analysis,
      credits_enhancement,
      credits_exam,
      credits_export
    });

  } catch (error) {
    console.error('Error in balance API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}