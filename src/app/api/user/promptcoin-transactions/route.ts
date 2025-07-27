import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createServerClient();
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch PromptCoin transactions for the user
    const { data: transactions, error: transactionsError } = await supabase
      .from('promptcoin_transactions')
      .select(`
        id,
        transaction_type,
        amount,
        balance_after,
        description,
        created_at
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50); // Limit to last 50 transactions

    if (transactionsError) {
      console.error('Error fetching PromptCoin transactions:', transactionsError);
      return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      transactions: transactions || []
    });

  } catch (error) {
    console.error('Unexpected error in promptcoin-transactions API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}