import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// Get reviews for a specific prompt
export async function GET(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  const searchParams = req.nextUrl.searchParams;
  const promptId = searchParams.get('promptId');

  if (!promptId) {
    return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
  }

  try {
    // Get all reviews for the prompt with profile info
    const { data: reviews, error } = await supabase
      .from('smart_prompt_reviews')
      .select(`
        id,
        rating,
        review_text,
        helpful_votes,
        created_at,
        reviewer_id,
        profiles!smart_prompt_reviews_reviewer_id_fkey(full_name)
      `)
      .eq('prompt_id', promptId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching reviews:', error);
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
    }

    // Mark user's own review if logged in
    const reviewsWithOwnership = reviews?.map(review => ({
      ...review,
      is_own_review: user && review.reviewer_id === user.id
    })) || [];

    // Update prompt rating aggregates
    if (reviews && reviews.length > 0) {
      const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
      const { error: updateError } = await supabase
        .from('saved_prompts')
        .update({
          rating_average: Number(averageRating.toFixed(2)),
          rating_count: reviews.length
        })
        .eq('id', promptId);

      if (updateError) {
        console.error('Error updating prompt ratings:', updateError);
      }
    }

    return NextResponse.json({ reviews: reviewsWithOwnership });
  } catch (error) {
    console.error('Error in reviews GET:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Create a new review
export async function POST(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { promptId, rating, reviewText } = await req.json();

    if (!promptId || !rating || !reviewText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    if (reviewText.trim().length < 10) {
      return NextResponse.json({ error: 'Review must be at least 10 characters long' }, { status: 400 });
    }

    // Check if user has purchased this prompt
    const { data: purchase, error: purchaseError } = await supabase
      .from('smart_prompt_purchases')
      .select('id')
      .eq('prompt_id', promptId)
      .eq('buyer_id', user.id)
      .single();

    if (purchaseError || !purchase) {
      return NextResponse.json({ 
        error: 'You can only review Smart Prompts you have purchased' 
      }, { status: 403 });
    }

    // Check if user already reviewed this prompt
    const { data: existingReview } = await supabase
      .from('smart_prompt_reviews')
      .select('id')
      .eq('prompt_id', promptId)
      .eq('reviewer_id', user.id)
      .single();

    if (existingReview) {
      return NextResponse.json({ 
        error: 'You have already reviewed this Smart Prompt. Use the edit option to update your review.' 
      }, { status: 400 });
    }

    // Create the review
    const { error: insertError } = await supabase
      .from('smart_prompt_reviews')
      .insert({
        prompt_id: promptId,
        reviewer_id: user.id,
        rating,
        review_text: reviewText.trim()
      });

    if (insertError) {
      console.error('Error creating review:', insertError);
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Review submitted successfully!' });
  } catch (error) {
    console.error('Error in reviews POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Update an existing review
export async function PUT(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { reviewId, rating, reviewText } = await req.json();

    if (!reviewId || !rating || !reviewText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    if (reviewText.trim().length < 10) {
      return NextResponse.json({ error: 'Review must be at least 10 characters long' }, { status: 400 });
    }

    // Update the review (RLS will ensure user owns it)
    const { error: updateError } = await supabase
      .from('smart_prompt_reviews')
      .update({
        rating,
        review_text: reviewText.trim()
      })
      .eq('id', reviewId)
      .eq('reviewer_id', user.id);

    if (updateError) {
      console.error('Error updating review:', updateError);
      return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Review updated successfully!' });
  } catch (error) {
    console.error('Error in reviews PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete a review
export async function DELETE(req: Request) {
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

    // Delete the review (RLS will ensure user owns it)
    const { error: deleteError } = await supabase
      .from('smart_prompt_reviews')
      .delete()
      .eq('id', reviewId)
      .eq('reviewer_id', user.id);

    if (deleteError) {
      console.error('Error deleting review:', deleteError);
      return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Review deleted successfully!' });
  } catch (error) {
    console.error('Error in reviews DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}