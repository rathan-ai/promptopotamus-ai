import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * Get Prompt of the Day
 * Uses a deterministic algorithm based on the current date to select a quality prompt
 * This ensures the same prompt is shown to all users on the same day
 */
export async function GET() {
  try {
    const supabase = await createServerClient();

    // Get today's date string for deterministic selection
    const today = new Date();
    const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD
    const dayOfYear = getDayOfYear(today);

    // Fetch quality prompts (marketplace, public, with good metrics)
    const { data: qualityPrompts, error } = await supabase
      .from('saved_prompts')
      .select(`
        id,
        title,
        description,
        category,
        complexity_level,
        difficulty_level,
        price,
        downloads_count,
        rating_average,
        rating_count,
        created_at
      `)
      .eq('is_marketplace', true)
      .eq('is_public', true)
      .order('rating_average', { ascending: false, nullsFirst: false })
      .order('downloads_count', { ascending: false, nullsFirst: false })
      .limit(100); // Get top 100 quality prompts

    if (error) {
      console.error('Error fetching prompts for POTD:', error);
      return NextResponse.json({ error: 'Failed to fetch prompt of the day' }, { status: 500 });
    }

    if (!qualityPrompts || qualityPrompts.length === 0) {
      return NextResponse.json({
        prompt: null,
        dateString: formatDateDisplay(today),
        message: 'No prompts available'
      });
    }

    // Use day of year to deterministically select a prompt
    // This rotates through the quality prompts based on the date
    const selectedIndex = dayOfYear % qualityPrompts.length;
    const promptOfTheDay = qualityPrompts[selectedIndex];

    return NextResponse.json({
      prompt: promptOfTheDay,
      dateString: formatDateDisplay(today),
      totalQualityPrompts: qualityPrompts.length
    });

  } catch (error) {
    console.error('Error in prompt-of-day API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Get day of year (1-366)
 */
function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Format date for display
 */
function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
