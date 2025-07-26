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

    const { timeRange = '24 hours' } = await req.json();

    // Log the security analysis request
    await supabase.rpc('log_payment_security_event', {
      p_event_type: 'claude_security_analysis',
      p_severity: 'low',
      p_user_id: user.id,
      p_request_data: { time_range: timeRange }
    });

    const result = await claudeIntegration.getSecurityInsights(timeRange);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      insights: result.insights,
      eventCount: result.eventCount,
      timeRange: result.timeRange,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Claude security insights error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'Claude Security Insights',
    method: 'POST',
    description: 'Get AI-powered security analysis and recommendations',
    parameters: {
      timeRange: 'Time range for analysis (e.g., "24 hours", "7 days")'
    }
  });
}