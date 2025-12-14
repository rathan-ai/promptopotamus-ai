import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ purchasedIds: [] });
  }

  try {
    // Get just the prompt IDs that the user has purchased
    const { data: purchasedIds, error } = await supabase
      .from('smart_prompt_purchases')
      .select('prompt_id')
      .eq('buyer_id', user.id);

    if (error) {
      console.error('Error fetching purchased prompt IDs:', error);
      return NextResponse.json({ purchasedIds: [] });
    }

    const ids = purchasedIds?.map(p => p.prompt_id) || [];
    // TODO: Consider structured logging for purchased prompt metrics
    
    return NextResponse.json({ purchasedIds: ids });
  } catch (error) {
    console.error('Error fetching purchased prompt IDs:', error);
    return NextResponse.json({ purchasedIds: [] });
  }
}