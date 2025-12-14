import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { hasAnyValidCertificate } from '@/lib/certification';

interface SmartPromptFilters {
  category?: string;
  complexity?: 'simple' | 'smart' | 'recipe';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  priceRange?: 'free' | 'paid' | 'premium';
  tags?: string[];
}

export async function GET(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  // TODO: Consider structured logging for auth status in production monitoring

  // For marketplace prompts, allow public access
  // Marketplace prompts should be publicly viewable
  if (!user) {
    // TODO: Consider structured logging for public marketplace access
    // Continue with public access - marketplace prompts should be viewable by everyone
  }

  const searchParams = req.nextUrl.searchParams;
  const filters: SmartPromptFilters = {
    category: searchParams.get('category') || undefined,
    complexity: searchParams.get('complexity') as 'simple' | 'smart' | 'recipe' | undefined,
    difficulty: searchParams.get('difficulty') as 'beginner' | 'intermediate' | 'advanced' | undefined,
    priceRange: searchParams.get('priceRange') as 'free' | 'paid' | 'premium' | undefined,
    tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
  };

  try {
    // TODO: Consider structured logging for filter usage analytics

    // Build query based on filters - simplified to avoid potential join issues
    // Use basic columns that should definitely exist
    let query = supabase
      .from('saved_prompts')
      .select(`
        id,
        title,
        description,
        prompt_text,
        complexity_level,
        category,
        difficulty_level,
        tags,
        price,
        downloads_count,
        rating_average,
        rating_count,
        use_cases,
        ai_model_compatibility,
        created_at,
        user_id
      `);

    // Apply marketplace filters - check if these columns exist
    try {
      query = query.eq('is_marketplace', true);
    } catch (e) {
      // TODO: Handle missing is_marketplace column gracefully
    }
    
    try {
      query = query.eq('is_public', true);
    } catch (e) {
      // TODO: Handle missing is_public column gracefully
    }

    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters.complexity) {
      query = query.eq('complexity_level', filters.complexity);
    }
    
    if (filters.difficulty) {
      query = query.eq('difficulty_level', filters.difficulty);
    }
    
    if (filters.priceRange) {
      switch (filters.priceRange) {
        case 'free':
          query = query.eq('price', 0);
          break;
        case 'paid':
          query = query.gt('price', 0).lte('price', 25);
          break;
        case 'premium':
          query = query.gt('price', 25);
          break;
      }
    }
    
    if (filters.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }

    // Order by creation date as fallback, limit results
    try {
      query = query.order('rating_average', { ascending: false, nullsFirst: false })
                   .order('downloads_count', { ascending: false, nullsFirst: false });
    } catch (e) {
      // TODO: Handle missing rating columns gracefully
      query = query.order('created_at', { ascending: false });
    }
    
    query = query.limit(50);

    const { data: prompts, error } = await query;

    // TODO: Consider structured logging for query results monitoring

    if (error) {
      console.error('Error fetching smart prompts:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch smart prompts',
        details: error.message 
      }, { status: 500 });
    }

    // If no prompts found, still return success with empty array
    const result = prompts || [];
    // TODO: Consider structured logging for API response metrics
    
    return NextResponse.json({ prompts: result });
  } catch (error) {
    console.error('Unexpected error in smart-prompts API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const promptData = await req.json();
    
    // If user wants to create a marketplace prompt, check certification
    if (promptData.is_marketplace) {
      const { data: userCertificates } = await supabase
        .from('user_certificates')
        .select('certificate_slug, expires_at')
        .eq('user_id', user.id);

      if (!hasAnyValidCertificate(userCertificates || [])) {
        return NextResponse.json({ 
          error: 'You must have a valid certification to create marketplace prompts. Complete a certification exam first.',
          requiresCertification: true 
        }, { status: 403 });
      }
    }

    // Check current prompt count for non-marketplace prompts
    if (!promptData.is_marketplace) {
      const MAX_PROMPTS = 10;
      const { count, error: countError } = await supabase
        .from('saved_prompts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_marketplace', false);
      
      if (countError) {
        return NextResponse.json({ error: 'Could not verify prompt count.' }, { status: 500 });
      }

      if (count !== null && count >= MAX_PROMPTS) {
        return NextResponse.json({ 
          error: `You have reached the limit of ${MAX_PROMPTS} personal prompts. Upgrade to Pro or create marketplace prompts instead.` 
        }, { status: 403 });
      }
    }

    // Insert new smart prompt
    const { error: insertError } = await supabase
      .from('saved_prompts')
      .insert({ 
        ...promptData, 
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error creating smart prompt:', insertError);
      return NextResponse.json({ error: `Failed to create smart prompt: ${insertError.message}` }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: promptData.is_marketplace 
        ? 'Marketplace smart prompt created successfully!' 
        : 'Personal smart prompt saved successfully!' 
    });
  } catch (error) {
    console.error('Unexpected error creating smart prompt:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, ...updateData } = await req.json();

    // If updating to marketplace status, check certification
    if (updateData.is_marketplace) {
      const { data: userCertificates } = await supabase
        .from('user_certificates')
        .select('certificate_slug, expires_at')
        .eq('user_id', user.id);

      if (!hasAnyValidCertificate(userCertificates || [])) {
        return NextResponse.json({ 
          error: 'You must have a valid certification to create marketplace prompts.',
          requiresCertification: true 
        }, { status: 403 });
      }
    }

    // Update smart prompt (RLS will ensure user owns it)
    const { error: updateError } = await supabase
      .from('saved_prompts')
      .update({ 
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating smart prompt:', updateError);
      return NextResponse.json({ error: `Failed to update smart prompt: ${updateError.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Smart prompt updated successfully!' });
  } catch (error) {
    console.error('Unexpected error updating smart prompt:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, ...updateData } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Smart prompt ID is required' }, { status: 400 });
    }

    // If updating to marketplace status, check certification
    if (updateData.is_marketplace) {
      const { data: userCertificates } = await supabase
        .from('user_certificates')
        .select('certificate_slug, expires_at')
        .eq('user_id', user.id);

      if (!hasAnyValidCertificate(userCertificates || [])) {
        return NextResponse.json({ 
          error: 'You must have a valid certification to publish prompts in the marketplace.',
          requiresCertification: true 
        }, { status: 403 });
      }
    }

    // Update smart prompt (RLS will ensure user owns it)
    const { error: updateError } = await supabase
      .from('saved_prompts')
      .update({ 
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating smart prompt status:', updateError);
      return NextResponse.json({ error: `Failed to update smart prompt: ${updateError.message}` }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: updateData.is_marketplace 
        ? 'Smart prompt published to marketplace successfully!' 
        : 'Smart prompt unpublished from marketplace successfully!'
    });
  } catch (error) {
    console.error('Unexpected error updating smart prompt status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}