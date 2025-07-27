import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Create some test Smart Prompts
    const testPrompts = [
      {
        title: 'Business Strategy Analyzer',
        description: 'Get professional business strategy analysis with actionable recommendations, risk assessment, and implementation roadmaps.',
        prompt_text: 'Analyze the business strategy for [business description] and provide:\n\n1. Current situation assessment\n2. Strategic recommendations (3-5 actionable strategies)\n3. Risk assessment with mitigation strategies\n4. Implementation roadmap (30-60-90 day action plan)\n\nFocus on practical, data-driven recommendations that can be implemented with available resources.',
        complexity_level: 'recipe',
        category: 'Business & Strategy',
        difficulty_level: 'advanced',
        tags: ['business', 'strategy', 'consulting', 'analysis'],
        price: 0,
        downloads_count: 0,
        rating_average: 0,
        rating_count: 0,
        use_cases: ['Strategic planning', 'Business consulting', 'Competitive analysis'],
        ai_model_compatibility: ['GPT-4', 'Claude', 'Gemini'],
        user_id: user.id,
        is_marketplace: true,
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        title: 'The Ultimate Blog Post Writer',
        description: 'Create professional, engaging blog posts with proper structure, SEO optimization, and compelling content.',
        prompt_text: 'Write a comprehensive blog post about [topic] that includes:\n\n1. Attention-grabbing headline\n2. Compelling introduction\n3. Well-structured body with subheadings\n4. Actionable tips or insights\n5. Strong conclusion with call-to-action\n6. SEO-optimized content\n\nTarget audience: [audience]\nTone: [tone]\nWord count: [word_count]',
        complexity_level: 'recipe',
        category: 'Writing & Content',
        difficulty_level: 'intermediate',
        tags: ['writing', 'content', 'blog', 'seo'],
        price: 0,
        downloads_count: 0,
        rating_average: 0,
        rating_count: 0,
        use_cases: ['Content marketing', 'Blog writing', 'SEO content'],
        ai_model_compatibility: ['GPT-4', 'Claude', 'Gemini'],
        user_id: user.id,
        is_marketplace: true,
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        title: 'Code Review & Optimization Expert',
        description: 'Get expert code reviews with specific improvements, security recommendations, and performance optimizations.',
        prompt_text: 'Review the following code and provide:\n\n1. Code quality assessment\n2. Specific improvement suggestions\n3. Security vulnerability analysis\n4. Performance optimization recommendations\n5. Best practices implementation\n6. Refactored code examples\n\nCode to review:\n[code]\n\nProgramming language: [language]\nContext: [context]',
        complexity_level: 'smart',
        category: 'Development & Technology',
        difficulty_level: 'advanced',
        tags: ['coding', 'programming', 'review', 'optimization'],
        price: 0,
        downloads_count: 0,
        rating_average: 0,
        rating_count: 0,
        use_cases: ['Code review', 'Performance optimization', 'Security analysis'],
        ai_model_compatibility: ['GPT-4', 'Claude', 'Gemini'],
        user_id: user.id,
        is_marketplace: true,
        is_public: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    console.log('Creating test prompts:', testPrompts.length);

    const { data: insertedPrompts, error: insertError } = await supabase
      .from('saved_prompts')
      .insert(testPrompts)
      .select('id, title');

    if (insertError) {
      console.error('Error inserting test prompts:', insertError);
      return NextResponse.json({ 
        error: 'Failed to create test prompts',
        details: insertError.message 
      }, { status: 500 });
    }

    console.log('Test prompts created:', insertedPrompts);

    return NextResponse.json({ 
      success: true, 
      message: `Created ${testPrompts.length} test Smart Prompts`,
      prompts: insertedPrompts
    });

  } catch (error) {
    console.error('Error creating test data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}