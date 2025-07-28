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

    // Get prompt details with creator info - allow owners to access their own prompts
    let prompt, promptError;
    
    if (user) {
      // If user is logged in, check if they own the prompt first
      const { data: ownedPrompt, error: ownedError } = await supabase
        .from('saved_prompts')
        .select(`
          *,
          profiles!saved_prompts_user_id_fkey(full_name)
        `)
        .eq('id', promptId)
        .eq('user_id', user.id)
        .single();
      
      if (ownedPrompt && !ownedError) {
        // User owns this prompt, allow access regardless of marketplace/public flags
        prompt = ownedPrompt;
        promptError = null;
      } else {
        // Not owned by user, check marketplace prompts
        const { data: marketplacePrompt, error: marketplaceError } = await supabase
          .from('saved_prompts')
          .select(`
            *,
            profiles!saved_prompts_user_id_fkey(full_name)
          `)
          .eq('id', promptId)
          .eq('is_marketplace', true)
          .eq('is_public', true)
          .single();
        
        prompt = marketplacePrompt;
        promptError = marketplaceError;
      }
    } else {
      // Anonymous user, only show public marketplace prompts
      const { data: publicPrompt, error: publicError } = await supabase
        .from('saved_prompts')
        .select(`
          *,
          profiles!saved_prompts_user_id_fkey(full_name)
        `)
        .eq('id', promptId)
        .eq('is_marketplace', true)
        .eq('is_public', true)
        .single();
      
      prompt = publicPrompt;
      promptError = publicError;
    }

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

    // Create preview text for non-purchased prompts
    let promptPreview = '';
    if (!hasAccess && prompt.prompt_text) {
      // Show first 200 characters with ellipsis
      const fullText = prompt.prompt_text;
      if (fullText.length > 200) {
        promptPreview = fullText.substring(0, 200) + '...';
      } else {
        // If less than 200 chars, show first half
        const halfLength = Math.floor(fullText.length / 2);
        promptPreview = fullText.substring(0, halfLength) + '...';
      }
    }

    return NextResponse.json({
      prompt: {
        ...prompt,
        // Only include full prompt_text if user has access
        prompt_text: hasAccess ? prompt.prompt_text : undefined,
        prompt_preview: !hasAccess ? promptPreview : undefined,
        has_access: hasAccess,
        has_purchased: hasPurchased,
        is_owner: prompt.user_id === user?.id,
        current_user_id: user?.id || null
      }
    });

  } catch (error) {
    console.error('Error fetching prompt details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const promptId = parseInt(params.id);
    const updateData = await req.json();

    // First verify the user owns this prompt
    const { data: existingPrompt, error: fetchError } = await supabase
      .from('saved_prompts')
      .select('id, user_id, title')
      .eq('id', promptId)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !existingPrompt) {
      return NextResponse.json({ error: 'Prompt not found or access denied' }, { status: 404 });
    }

    // Update the prompt
    const { error: updateError } = await supabase
      .from('saved_prompts')
      .update({
        title: updateData.title,
        description: updateData.description,
        prompt_text: updateData.prompt_text,
        complexity_level: updateData.complexity_level,
        category: updateData.category,
        difficulty_level: updateData.difficulty_level,
        tags: updateData.tags || [],
        use_cases: updateData.use_cases || [],
        ai_model_compatibility: updateData.ai_model_compatibility || [],
        variables: updateData.variables || [],
        recipe_steps: updateData.recipe_steps || [],
        instructions: updateData.instructions || '',
        example_inputs: updateData.example_inputs || {},
        example_outputs: updateData.example_outputs || [],
        price: updateData.price || 0,
        is_marketplace: updateData.is_marketplace || false,
        is_public: updateData.is_public || false,
        updated_at: new Date().toISOString()
      })
      .eq('id', promptId);

    if (updateError) {
      console.error('Error updating prompt:', updateError);
      return NextResponse.json({ error: 'Failed to update prompt' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Smart Prompt updated successfully!',
      id: promptId
    });

  } catch (error) {
    console.error('Error updating prompt:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}