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

    // TODO: Add admin role check here
    // For now, we'll allow all authenticated users

    const { tableFilter } = await req.json();

    // Log the analysis request
    await supabase.rpc('log_payment_security_event', {
      p_event_type: 'claude_database_analysis',
      p_severity: 'low',
      p_user_id: user.id,
      p_request_data: { table_filter: tableFilter }
    });

    const result = await claudeIntegration.analyzeDatabasePerformance(tableFilter);

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
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Claude database analysis error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'Claude Database Analysis',
    method: 'POST',
    description: 'Analyze database performance using Claude AI',
    parameters: {
      tableFilter: 'Optional string to filter specific tables'
    }
  });
}