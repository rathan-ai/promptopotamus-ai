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
      p_event_type: 'claude_business_analysis',
      p_severity: 'low',
      p_user_id: user.id,
      p_request_data: { time_range: timeRange }
    });

    const result = await claudeIntegration.analyzeBusinessMetrics(timeRange);

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
    console.error('Claude business metrics analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'Claude Business Metrics Analysis',
    method: 'POST',
    description: 'Analyze business performance and revenue metrics using AI',
    parameters: {
      timeRange: 'Time period for analysis (e.g., "7 days", "30 days", "90 days")'
    },
    metrics_analyzed: [
      'Revenue from prompt sales',
      'Subscription revenue streams',
      'Affiliate program performance',
      'Transaction volumes and patterns',
      'Payment provider distribution',
      'Commission and conversion rates'
    ],
    insights_provided: [
      'Revenue analysis and growth trends',
      'Transaction volume insights',
      'Affiliate program effectiveness',
      'Revenue optimization opportunities',
      'Business health indicators',
      'Growth recommendations',
      'Risk assessment and mitigation strategies'
    ]
  });
}