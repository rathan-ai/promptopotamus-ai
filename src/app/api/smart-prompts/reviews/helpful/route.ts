import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

// Record a helpful vote for a review
export async function POST(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { reviewId } = await req.json();

    if (!reviewId) {
      return NextResponse.json({ error: 'Review ID is required' }, { status: 400 });
    }

    // Check if the review exists and get current helpful votes count
    const { data: review, error: reviewError } = await supabase
      .from('smart_prompt_reviews')
      .select('id, helpful_votes, reviewer_id')
      .eq('id', reviewId)
      .single();

    if (reviewError || !review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Don't allow users to vote on their own reviews
    if (review.reviewer_id === user.id) {
      return NextResponse.json({ error: 'You cannot vote on your own review' }, { status: 400 });
    }

    // For now, we'll just increment the helpful votes count
    // In a more complex implementation, we might track who voted to prevent duplicate votes
    const { error: updateError } = await supabase
      .from('smart_prompt_reviews')
      .update({
        helpful_votes: review.helpful_votes + 1
      })
      .eq('id', reviewId);

    if (updateError) {
      console.error('Error updating helpful votes:', updateError);
      return NextResponse.json({ error: 'Failed to record helpful vote' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Thank you for your feedback!',
      newHelpfulVotes: review.helpful_votes + 1
    });
  } catch (error) {
    console.error('Error in helpful votes POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}