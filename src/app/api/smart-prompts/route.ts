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
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const filters: SmartPromptFilters = {
    category: searchParams.get('category') || undefined,
    complexity: searchParams.get('complexity') as any || undefined,
    difficulty: searchParams.get('difficulty') as any || undefined,
    priceRange: searchParams.get('priceRange') as any || undefined,
    tags: searchParams.get('tags')?.split(',').filter(Boolean) || undefined,
  };

  try {
    // Build query based on filters
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
        user_id,
        profiles!saved_prompts_user_id_fkey(full_name)
      `)
      .eq('is_marketplace', true)
      .eq('is_public', true);

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

    // Order by rating and downloads
    query = query.order('rating_average', { ascending: false })
                 .order('downloads_count', { ascending: false })
                 .limit(50);

    const { data: prompts, error } = await query;

    if (error) {
      console.error('Error fetching smart prompts:', error);
      return NextResponse.json({ error: 'Failed to fetch smart prompts' }, { status: 500 });
    }

    return NextResponse.json({ prompts: prompts || [] });
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