import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { serverEmailAutomation } from '@/lib/email-automation-server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    // Check for admin authentication or API key
    const authHeader = request.headers.get('authorization');
    const apiKey = request.headers.get('x-api-key');
    
    let isAuthorized = false;
    
    if (authHeader?.startsWith('Bearer ')) {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (user) {
        // Check if user is admin
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
        
        isAuthorized = profile?.role === 'admin';
      }
    } else if (apiKey) {
      // Check API key (you should store this securely)
      isAuthorized = apiKey === process.env.EMAIL_API_KEY;
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, userId, campaignKey, templateData, customEmail } = body;

    switch (action) {
      case 'send_campaign':
        if (!userId || !campaignKey) {
          return NextResponse.json(
            { error: 'Missing required parameters: userId, campaignKey' },
            { status: 400 }
          );
        }

        const success = await serverEmailAutomation.sendCampaignEmail(
          userId,
          campaignKey,
          templateData || {},
          customEmail
        );

        return NextResponse.json({
          success,
          action: 'send_campaign',
          userId,
          campaignKey
        });

      case 'send_weekly_digest':
        const digestResult = await serverEmailAutomation.sendWeeklyDigest();
        
        return NextResponse.json({
          success: true,
          action: 'send_weekly_digest',
          sent: digestResult.sent,
          failed: digestResult.failed
        });

      case 'send_achievement_notification':
        const { achievementName, achievementDescription, xpEarned } = body;
        
        if (!userId || !achievementName || !achievementDescription) {
          return NextResponse.json(
            { error: 'Missing required parameters: userId, achievementName, achievementDescription' },
            { status: 400 }
          );
        }

        const achievementSuccess = await serverEmailAutomation.sendAchievementNotification(
          userId,
          achievementName,
          achievementDescription,
          xpEarned || 0
        );

        return NextResponse.json({
          success: achievementSuccess,
          action: 'send_achievement_notification',
          userId
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Email send API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'campaigns', 'sends', 'stats'
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    switch (type) {
      case 'campaigns':
        const { data: campaigns, error: campaignError } = await supabase
          .from('email_campaigns')
          .select('*')
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (campaignError) {
          return NextResponse.json(
            { error: 'Failed to fetch campaigns' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          campaigns: campaigns || [],
          type: 'campaigns'
        });

      case 'sends':
        const userId = searchParams.get('userId');
        const campaignId = searchParams.get('campaignId');
        
        let sendsQuery = supabase
          .from('email_sends')
          .select(`
            *,
            profiles!email_sends_user_id_fkey(name, email),
            email_campaigns!email_sends_campaign_id_fkey(campaign_name, campaign_type)
          `)
          .order('sent_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (userId) {
          sendsQuery = sendsQuery.eq('user_id', userId);
        }
        if (campaignId) {
          sendsQuery = sendsQuery.eq('campaign_id', campaignId);
        }

        const { data: sends, error: sendsError } = await sendsQuery;

        if (sendsError) {
          return NextResponse.json(
            { error: 'Failed to fetch email sends' },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          sends: sends || [],
          type: 'sends'
        });

      case 'stats':
        // Get email statistics
        const { data: totalSends } = await supabase
          .from('email_sends')
          .select('id', { count: 'exact' });

        const { data: deliveredSends } = await supabase
          .from('email_sends')
          .select('id', { count: 'exact' })
          .eq('status', 'delivered');

        const { data: openedSends } = await supabase
          .from('email_sends')
          .select('id', { count: 'exact' })
          .eq('status', 'opened');

        const { data: clickedSends } = await supabase
          .from('email_sends')
          .select('id', { count: 'exact' })
          .eq('status', 'clicked');

        return NextResponse.json({
          success: true,
          stats: {
            total_sends: totalSends?.length || 0,
            delivered: deliveredSends?.length || 0,
            opened: openedSends?.length || 0,
            clicked: clickedSends?.length || 0,
            delivery_rate: totalSends?.length ? (deliveredSends?.length || 0) / totalSends.length : 0,
            open_rate: deliveredSends?.length ? (openedSends?.length || 0) / deliveredSends.length : 0,
            click_rate: openedSends?.length ? (clickedSends?.length || 0) / openedSends.length : 0
          },
          type: 'stats'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid type parameter' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Email data API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}