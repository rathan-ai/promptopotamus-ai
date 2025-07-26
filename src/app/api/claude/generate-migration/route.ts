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

    const { 
      description, 
      requirements,
      tableNames = [],
      migrationName
    } = await req.json();

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    // Log the generation request
    await supabase.rpc('log_payment_security_event', {
      p_event_type: 'claude_migration_generation',
      p_severity: 'low',
      p_user_id: user.id,
      p_request_data: { 
        description,
        requirements: requirements || '',
        table_names: tableNames,
        migration_name: migrationName || ''
      }
    });

    const result = await claudeIntegration.generateMigration({
      description,
      requirements,
      tableNames,
      migrationName
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      migrationName: result.migrationName,
      migrationContent: result.migrationContent,
      analysis: result.analysis,
      warnings: result.warnings || [],
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Claude migration generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'Claude Migration Generation',
    method: 'POST',
    description: 'Generate database migrations using natural language descriptions',
    parameters: {
      description: 'Natural language description of the desired schema changes',
      requirements: 'Optional: Specific requirements or constraints',
      tableNames: 'Optional: Array of table names that will be affected',
      migrationName: 'Optional: Suggested name for the migration'
    },
    examples: {
      addUserPreferences: {
        description: 'Add a user preferences table to store user customization settings',
        requirements: 'Include JSONB column for flexible preference storage, foreign key to profiles table',
        tableNames: ['user_preferences'],
        migrationName: 'add_user_preferences_table'
      },
      enhancePayments: {
        description: 'Add support for cryptocurrency payments in the payment system',
        requirements: 'Add crypto wallet address field, transaction hash tracking, blockchain network field',
        tableNames: ['profiles', 'smart_prompt_purchases'],
        migrationName: 'add_cryptocurrency_support'
      }
    }
  });
}