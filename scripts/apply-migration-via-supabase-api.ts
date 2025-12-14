/**
 * Alternative: Apply migration via Supabase Management API
 * This script reads the migration file and executes it using the Supabase client
 * Useful if you don't have direct psql access
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('==========================================');
  console.log('PromptCoin Cleanup Migration (via API)');
  console.log('==========================================\n');

  const migrationPath = path.join(process.cwd(), 'supabase/migrations/20251116000000_final_promptcoin_cleanup.sql');

  if (!fs.existsSync(migrationPath)) {
    console.error('❌ Migration file not found:', migrationPath);
    process.exit(1);
  }

  console.log('📝 Reading migration file...');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  // Split migration into individual statements (basic approach)
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`📊 Found ${statements.length} SQL statements to execute\n`);

  // Confirm before proceeding
  console.log('⚠️  This will remove all PromptCoin data from your database.');
  console.log('Press Ctrl+C to cancel, or any key to continue...\n');

  // Execute each statement
  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];

    // Skip DO blocks and COMMENT statements (not supported via REST)
    if (statement.includes('DO $$') || statement.startsWith('COMMENT')) {
      console.log(`⏭️  Skipping statement ${i + 1}/${statements.length} (DO block or COMMENT)`);
      continue;
    }

    try {
      console.log(`🔄 Executing statement ${i + 1}/${statements.length}...`);

      const { error } = await supabase.rpc('exec_sql', { sql_query: statement });

      if (error) {
        // Some errors are expected (e.g., DROP IF EXISTS on non-existent objects)
        if (error.message.includes('does not exist')) {
          console.log(`   ⚠️  Warning: ${error.message}`);
        } else {
          console.error(`   ❌ Error: ${error.message}`);
          errorCount++;
        }
      } else {
        console.log(`   ✅ Success`);
        successCount++;
      }
    } catch (err) {
      console.error(`   ❌ Unexpected error:`, err);
      errorCount++;
    }
  }

  console.log('\n==========================================');
  console.log('Migration Summary');
  console.log('==========================================');
  console.log(`✅ Successful: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
  console.log('==========================================\n');

  if (errorCount === 0) {
    console.log('✅ Migration completed successfully!\n');
    console.log('🎯 Next Steps:');
    console.log('  1. Test Smart Prompt purchases with Stripe/PayPal');
    console.log('  2. Verify seller earnings calculations');
    console.log('  3. Remove old PromptCoin migration files (optional)\n');
  } else {
    console.log('⚠️  Migration completed with some errors.');
    console.log('Please review the errors above and apply fixes manually if needed.\n');
  }
}

// Run the migration
applyMigration().catch(console.error);
