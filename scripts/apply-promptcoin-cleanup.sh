#!/bin/bash

# Script to apply PromptCoin cleanup migration to production Supabase
# Date: 2025-11-16

set -e  # Exit on error

echo "=========================================="
echo "PromptCoin Cleanup Migration Script"
echo "=========================================="
echo ""

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
else
    echo "❌ Error: .env.local file not found"
    exit 1
fi

# Check required environment variables
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ Error: NEXT_PUBLIC_SUPABASE_URL not set in .env.local"
    exit 1
fi

if [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: SUPABASE_SERVICE_ROLE_KEY not set in .env.local"
    exit 1
fi

# Extract database connection string from Supabase URL
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed -n 's|https://\([^.]*\)\.supabase\.co|\1|p')

echo "📊 Target Database: $NEXT_PUBLIC_SUPABASE_URL"
echo "🔑 Using Service Role Key: ${SUPABASE_SERVICE_ROLE_KEY:0:20}..."
echo ""

# Confirm before proceeding
read -p "⚠️  This will remove all PromptCoin data from your database. Continue? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "❌ Migration cancelled"
    exit 0
fi

echo ""
echo "🚀 Applying migration..."
echo ""

# Get database password (you'll need to set this)
if [ -z "$SUPABASE_DB_PASSWORD" ]; then
    read -sp "Enter your Supabase database password: " SUPABASE_DB_PASSWORD
    echo ""
fi

# Apply migration using psql
MIGRATION_FILE="supabase/migrations/20251116000000_final_promptcoin_cleanup.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file not found at $MIGRATION_FILE"
    exit 1
fi

# Connection string for Supabase
DB_URL="postgresql://postgres:${SUPABASE_DB_PASSWORD}@db.${PROJECT_REF}.supabase.co:5432/postgres"

echo "📝 Running migration file: $MIGRATION_FILE"
echo ""

# Run the migration
psql "$DB_URL" -f "$MIGRATION_FILE" 2>&1 | tee migration-output.log

EXIT_CODE=${PIPESTATUS[0]}

echo ""

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📋 Summary:"
    echo "  - PromptCoin columns removed from profiles table"
    echo "  - promptcoin_transactions table dropped"
    echo "  - All PromptCoin functions and triggers removed"
    echo "  - smart_prompt_purchases updated for USD payments"
    echo "  - seller_earnings_summary view created"
    echo ""
    echo "📝 Full output saved to: migration-output.log"
    echo ""
    echo "🎯 Next Steps:"
    echo "  1. Deploy updated application code (already done in codebase)"
    echo "  2. Test Smart Prompt purchases with Stripe/PayPal"
    echo "  3. Verify seller earnings calculations"
    echo "  4. Remove old PromptCoin migration files (optional)"
else
    echo "❌ Migration failed with exit code $EXIT_CODE"
    echo "📝 Check migration-output.log for details"
    exit $EXIT_CODE
fi
