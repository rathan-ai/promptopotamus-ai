import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createServerClient();

  try {
    // Get trending prompts (high downloads in recent period)
    const { data: trending, error: trendingError } = await supabase
      .from('saved_prompts')
      .select(`
        id,
        title,
        description,
        complexity_level,
        category,
        difficulty_level,
        price,
        downloads_count,
        rating_average,
        rating_count
      `)
      .eq('is_marketplace', true)
      .eq('is_public', true)
      .gt('downloads_count', 0)
      .order('downloads_count', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(6);

    // Get top rated prompts (highest ratings with minimum reviews)
    const { data: topRated, error: topRatedError } = await supabase
      .from('saved_prompts')
      .select(`
        id,
        title,
        description,
        complexity_level,
        category,
        difficulty_level,
        price,
        downloads_count,
        rating_average,
        rating_count
      `)
      .eq('is_marketplace', true)
      .eq('is_public', true)
      .gte('rating_count', 1)
      .order('rating_average', { ascending: false })
      .order('rating_count', { ascending: false })
      .limit(6);

    // Get most purchased prompts (highest download count)
    const { data: mostPurchased, error: mostPurchasedError } = await supabase
      .from('saved_prompts')
      .select(`
        id,
        title,
        description,
        complexity_level,
        category,
        difficulty_level,
        price,
        downloads_count,
        rating_average,
        rating_count
      `)
      .eq('is_marketplace', true)
      .eq('is_public', true)
      .gt('downloads_count', 0)
      .order('downloads_count', { ascending: false })
      .limit(6);

    // Get recently added prompts (newest first)
    const { data: recentlyAdded, error: recentlyAddedError } = await supabase
      .from('saved_prompts')
      .select(`
        id,
        title,
        description,
        complexity_level,
        category,
        difficulty_level,
        price,
        downloads_count,
        rating_average,
        rating_count,
        created_at
      `)
      .eq('is_marketplace', true)
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(6);

    // Get free prompts (price = 0)
    const { data: freePrompts, error: freePromptsError } = await supabase
      .from('saved_prompts')
      .select(`
        id,
        title,
        description,
        complexity_level,
        category,
        difficulty_level,
        price,
        downloads_count,
        rating_average,
        rating_count
      `)
      .eq('is_marketplace', true)
      .eq('is_public', true)
      .eq('price', 0)
      .order('downloads_count', { ascending: false })
      .order('rating_average', { ascending: false })
      .limit(6);

    // Get editor's choice (high quality prompts with good ratings and descriptions)
    const { data: editorsChoice, error: editorsChoiceError } = await supabase
      .from('saved_prompts')
      .select(`
        id,
        title,
        description,
        complexity_level,
        category,
        difficulty_level,
        price,
        downloads_count,
        rating_average,
        rating_count
      `)
      .eq('is_marketplace', true)
      .eq('is_public', true)
      .not('description', 'is', null)
      .gte('rating_average', 4.0)
      .gte('rating_count', 2)
      .order('rating_average', { ascending: false })
      .order('downloads_count', { ascending: false })
      .limit(6);

    // Get marketplace stats
    const [
      { count: totalPrompts },
      { count: totalCreators },
      { count: totalDownloads }
    ] = await Promise.all([
      supabase
        .from('saved_prompts')
        .select('*', { count: 'exact', head: true })
        .eq('is_marketplace', true)
        .eq('is_public', true),
      supabase
        .from('saved_prompts')
        .select('user_id', { count: 'exact', head: true })
        .eq('is_marketplace', true)
        .eq('is_public', true),
      supabase
        .from('smart_prompt_purchases')
        .select('*', { count: 'exact', head: true })
    ]);

    // Check for errors
    if (trendingError) console.error('Error fetching trending prompts:', trendingError);
    if (topRatedError) console.error('Error fetching top rated prompts:', topRatedError);
    if (mostPurchasedError) console.error('Error fetching most purchased prompts:', mostPurchasedError);
    if (recentlyAddedError) console.error('Error fetching recently added prompts:', recentlyAddedError);
    if (freePromptsError) console.error('Error fetching free prompts:', freePromptsError);
    if (editorsChoiceError) console.error('Error fetching editor\'s choice prompts:', editorsChoiceError);

    return NextResponse.json({
      sections: {
        trending: trending || [],
        topRated: topRated || [],
        mostPurchased: mostPurchased || [],
        recentlyAdded: recentlyAdded || [],
        freePrompts: freePrompts || [],
        editorsChoice: editorsChoice || []
      },
      stats: {
        totalPrompts: totalPrompts || 0,
        totalCreators: totalCreators || 0,
        totalDownloads: totalDownloads || 0
      }
    });
  } catch (error) {
    console.error('Error fetching featured prompts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}