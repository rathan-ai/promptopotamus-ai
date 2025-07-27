import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { hasAnyValidCertificate } from '@/lib/certification';

export async function GET(req: NextRequest) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const type = searchParams.get('type') || 'all'; // 'created', 'purchased', 'all'

  try {
    // Get user's certification status for marketplace features
    const { data: userCertificates } = await supabase
      .from('user_certificates')
      .select('certificate_slug, expires_at, earned_at, credential_id')
      .eq('user_id', user.id);

    const hasValidCertificate = hasAnyValidCertificate(userCertificates || []);

    let createdPrompts = [];
    let purchasedPrompts = [];

    // Get created prompts
    if (type === 'created' || type === 'all') {
      const { data: created } = await supabase
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
          is_marketplace,
          is_public,
          created_at,
          updated_at,
          variables,
          recipe_steps,
          instructions,
          example_inputs,
          example_outputs
        `)
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      createdPrompts = created || [];
    }

    // Get purchased prompts
    if (type === 'purchased' || type === 'all') {
      const { data: purchased, error: purchaseError } = await supabase
        .from('smart_prompt_purchases')
        .select(`
          id,
          purchase_price,
          purchased_at,
          prompt_id,
          saved_prompts!prompt_id (
            id,
            title,
            description,
            prompt_text,
            complexity_level,
            category,
            difficulty_level,
            tags,
            use_cases,
            ai_model_compatibility,
            variables,
            recipe_steps,
            instructions,
            example_inputs,
            example_outputs,
            user_id
          )
        `)
        .eq('buyer_id', user.id)
        .order('purchased_at', { ascending: false });

      if (purchaseError) {
        console.error('Error fetching purchased prompts:', purchaseError);
      }

      purchasedPrompts = purchased?.map(purchase => {
        if (!purchase.saved_prompts) {
          console.warn('Purchase missing saved_prompts data:', purchase);
          return null;
        }
        return {
          ...purchase.saved_prompts,
          purchase_info: {
            purchase_price: purchase.purchase_price,
            purchased_at: purchase.purchased_at
          }
        };
      }).filter(Boolean) || [];

      console.log('Purchased prompts processed:', purchasedPrompts.length, 'from', purchased?.length || 0, 'raw purchases');
    }

    // Get sales analytics for created marketplace prompts
    const { data: salesData, error: salesError } = await supabase
      .from('smart_prompt_purchases')
      .select(`
        prompt_id,
        purchase_price,
        purchased_at,
        saved_prompts!prompt_id(title)
      `)
      .eq('seller_id', user.id)
      .order('purchased_at', { ascending: false });

    if (salesError) {
      console.error('Error fetching sales data:', salesError);
    }

    // Calculate sales statistics
    const salesStats = {
      totalSales: salesData?.length || 0,
      totalRevenue: salesData?.reduce((sum, sale) => sum + (sale.purchase_price || 0), 0) || 0,
      recentSales: salesData?.slice(0, 10) || []
    };

    return NextResponse.json({
      created: createdPrompts,
      purchased: purchasedPrompts,
      salesStats,
      canCreateMarketplace: hasValidCertificate,
      certificationStatus: {
        hasValidCertificate,
        certificates: userCertificates
      }
    });

  } catch (error) {
    console.error('Error fetching user smart prompts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Delete a user's created prompt
export async function DELETE(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { promptId } = await req.json();

    if (!promptId) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    // Check if prompt has been sold - prevent deletion if it has purchases
    const { data: purchases, error: purchaseCheckError } = await supabase
      .from('smart_prompt_purchases')
      .select('id')
      .eq('prompt_id', promptId)
      .eq('seller_id', user.id);

    if (purchaseCheckError) {
      return NextResponse.json({ error: 'Error checking purchases' }, { status: 500 });
    }

    if (purchases && purchases.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete prompt that has been purchased by others. You can unpublish it instead.' 
      }, { status: 400 });
    }

    // Delete the prompt (RLS will ensure user owns it)
    const { error: deleteError } = await supabase
      .from('saved_prompts')
      .delete()
      .eq('id', promptId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Error deleting smart prompt:', deleteError);
      return NextResponse.json({ error: 'Failed to delete prompt' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Prompt deleted successfully' });

  } catch (error) {
    console.error('Error deleting smart prompt:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}