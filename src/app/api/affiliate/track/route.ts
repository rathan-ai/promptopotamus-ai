import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { AffiliateTracker } from '@/lib/affiliate-tracking';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // Get current user (optional for affiliate tracking)
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    const body = await request.json();
    const { 
      partnerKey, 
      source, 
      customParams = {},
      redirectUrl 
    } = body;

    if (!partnerKey || !source) {
      return NextResponse.json(
        { error: 'Missing required parameters: partnerKey, source' },
        { status: 400 }
      );
    }

    // Create affiliate tracker instance
    const tracker = new AffiliateTracker(true);

    // Extract request metadata
    const userAgent = request.headers.get('user-agent') || undefined;
    const referrer = request.headers.get('referer') || undefined;
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ipAddress = forwardedFor?.split(',')[0] || realIp || undefined;

    // Generate affiliate URL with tracking
    const affiliateUrl = await tracker.generateAffiliateUrl(
      partnerKey,
      source,
      user?.id,
      {
        ...customParams,
        user_agent: userAgent,
        referrer_url: referrer,
        ip_address: ipAddress
      }
    );

    if (!affiliateUrl) {
      return NextResponse.json(
        { error: 'Failed to generate affiliate URL' },
        { status: 500 }
      );
    }

    // If redirectUrl is provided, redirect directly
    if (redirectUrl === 'true') {
      return NextResponse.redirect(affiliateUrl);
    }

    // Otherwise return the URL for client-side redirect
    return NextResponse.json({
      success: true,
      affiliateUrl,
      partner: partnerKey,
      trackingId: `tracking_${Date.now()}`
    });

  } catch (error) {
    console.error('Affiliate tracking API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const searchParams = request.nextUrl.searchParams;
    const context = searchParams.get('context') as 'prompt_creation' | 'marketplace_browse' | 'certificate_earned';
    const category = searchParams.get('category');

    if (!context) {
      return NextResponse.json(
        { error: 'Context parameter required' },
        { status: 400 }
      );
    }

    // Get current user for personalization
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get user's expertise tags if available
    let userTags: string[] = [];
    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles_extended')
        .select('expertise_tags')
        .eq('user_id', user.id)
        .single();
      
      userTags = profile?.expertise_tags || [];
    }

    // Get contextual recommendations
    const tracker = new AffiliateTracker(true);
    const recommendations = await tracker.getContextualRecommendations(
      context,
      userTags,
      category || undefined
    );

    return NextResponse.json({
      success: true,
      context,
      recommendations: recommendations.map(partner => ({
        partnerKey: partner.partner_key,
        partnerName: partner.partner_name,
        commissionRate: partner.commission_rate
      }))
    });

  } catch (error) {
    console.error('Affiliate recommendations API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}