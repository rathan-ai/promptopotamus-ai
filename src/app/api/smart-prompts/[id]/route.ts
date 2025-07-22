import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(
  req: Request, 
  { params }: { params: { id: string } }
) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  try {
    const promptId = parseInt(params.id);

    // Get prompt details with creator info
    const { data: prompt, error: promptError } = await supabase
      .from('saved_prompts')
      .select(`
        *,
        profiles!saved_prompts_user_id_fkey(full_name)
      `)
      .eq('id', promptId)
      .eq('is_marketplace', true)
      .eq('is_public', true)
      .single();

    if (promptError || !prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 });
    }

    // Check if user has already purchased this prompt (if user is logged in)
    let hasPurchased = false;
    if (user) {
      const { data: purchase } = await supabase
        .from('smart_prompt_purchases')
        .select('id')
        .eq('prompt_id', promptId)
        .eq('buyer_id', user.id)
        .single();
      
      hasPurchased = !!purchase;
    }

    // User has access if it's free, they own it, or they've purchased it
    const hasAccess = prompt.price === 0 || prompt.user_id === user?.id || hasPurchased;

    return NextResponse.json({
      prompt: {
        ...prompt,
        has_access: hasAccess,
        has_purchased: hasPurchased,
        is_owner: prompt.user_id === user?.id
      }
    });

  } catch (error) {
    console.error('Error fetching prompt details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}