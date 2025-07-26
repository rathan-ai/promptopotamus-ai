import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

export async function POST(req: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Only allow authenticated admin users
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin role check here
    // For now, we'll allow all authenticated users for testing

    const { 
      migrationName, 
      migrationContent, 
      dryRun = true,
      autoApprove = false 
    } = await req.json();

    // Log the migration request
    await supabase.rpc('log_payment_security_event', {
      p_event_type: 'claude_migration_request',
      p_severity: 'medium',
      p_user_id: user.id,
      p_request_data: { 
        migration_name: migrationName,
        dry_run: dryRun,
        auto_approve: autoApprove,
        content_length: migrationContent?.length || 0
      }
    });

    let result;

    if (migrationName && migrationContent) {
      // Create and apply a new migration
      result = await createAndApplyMigration(migrationName, migrationContent, dryRun, autoApprove);
    } else {
      // Apply pending migrations
      result = await applyPendingMigrations(dryRun);
    }

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, details: result.details },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      result: result.output,
      migrationApplied: result.migrationApplied,
      dryRun,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Claude migration error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: 'Claude Database Migration',
    method: 'POST',
    description: 'Apply database migrations using Claude AI assistance',
    parameters: {
      migrationName: 'Optional: Name of new migration to create',
      migrationContent: 'Optional: SQL content for new migration',
      dryRun: 'Boolean: Preview changes without applying (default: true)',
      autoApprove: 'Boolean: Skip confirmation prompts (default: false)'
    },
    examples: {
      applyPending: {
        dryRun: true
      },
      createNew: {
        migrationName: 'add_user_preferences',
        migrationContent: 'ALTER TABLE profiles ADD COLUMN preferences JSONB DEFAULT \'{}\';',
        dryRun: false,
        autoApprove: false
      }
    }
  });
}

async function createAndApplyMigration(
  name: string, 
  content: string, 
  dryRun: boolean,
  autoApprove: boolean
): Promise<{success: boolean, output?: string, error?: string, details?: string, migrationApplied?: boolean}> {
  try {
    // Validate migration name
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+/, '').slice(0, 14);
    const migrationFileName = `${timestamp}_${name.replace(/[^a-zA-Z0-9_]/g, '_')}.sql`;
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', migrationFileName);

    if (dryRun) {
      // For dry run, just validate the SQL
      return {
        success: true,
        output: `DRY RUN: Would create migration ${migrationFileName}\\n\\nSQL Content:\\n${content}`,
        migrationApplied: false
      };
    }

    // Write migration file
    const fs = require('fs');
    fs.writeFileSync(migrationPath, content);

    // Apply migration using Supabase CLI
    const { stdout, stderr } = await execAsync('supabase db push', { 
      cwd: process.cwd(),
      env: { ...process.env, SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN }
    });

    return {
      success: true,
      output: `Migration ${migrationFileName} created and applied successfully.\\n\\nOutput:\\n${stdout}`,
      migrationApplied: true
    };

  } catch (error: any) {
    return {
      success: false,
      error: 'Migration failed',
      details: error.message || 'Unknown error occurred'
    };
  }
}

async function applyPendingMigrations(
  dryRun: boolean
): Promise<{success: boolean, output?: string, error?: string, details?: string, migrationApplied?: boolean}> {
  try {
    if (dryRun) {
      // Check for pending migrations
      const { stdout } = await execAsync('supabase migration list', { 
        cwd: process.cwd(),
        env: { ...process.env, SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN }
      });

      return {
        success: true,
        output: `DRY RUN: Migration status\\n\\n${stdout}`,
        migrationApplied: false
      };
    }

    // Apply pending migrations
    const { stdout, stderr } = await execAsync('supabase db push', { 
      cwd: process.cwd(),
      env: { ...process.env, SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_ACCESS_TOKEN }
    });

    return {
      success: true,
      output: `Migrations applied successfully.\\n\\nOutput:\\n${stdout}`,
      migrationApplied: true
    };

  } catch (error: any) {
    return {
      success: false,
      error: 'Failed to apply migrations',
      details: error.message || 'Unknown error occurred'
    };
  }
}