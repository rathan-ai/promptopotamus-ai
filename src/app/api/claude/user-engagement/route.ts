import { NextRequest, NextResponse } from 'next/server';
import { claudeIntegration } from '@/lib/claude-integration';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Only allow authenticated admin users
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { timeRange = '30 days' } = await req.json();

    // Log the analysis request
    await supabase.rpc('log_payment_security_event', {
      p_event_type: 'claude_engagement_analysis',
      p_severity: 'low',
      p_user_id: user.id,
      p_request_data: { time_range: timeRange }
    });

    const result = await claudeIntegration.analyzeUserEngagement(timeRange);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis: result.analysis,
      metrics: result.metrics,
      timeRange: result.timeRange,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Claude user engagement analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'Claude User Engagement Analysis',
    method: 'POST',
    description: 'Analyze user engagement patterns and platform metrics using AI',
    parameters: {
      timeRange: 'Time period for analysis (e.g., "7 days", "30 days", "90 days")'
    },
    metrics_analyzed: [
      'Total users and user growth',
      'Content creation and consumption',
      'Purchase patterns and marketplace activity',
      'Achievement and certification progress',
      'Quiz participation and learning engagement',
      'Social features usage',
      'Platform health indicators'
    ],
    insights_provided: [
      'Overall platform health assessment',
      'User engagement trends and patterns',
      'Content performance analysis',
      'Gamification effectiveness metrics',
      'Growth opportunities identification',
      'Actionable recommendations for improvement'
    ]
  });
}