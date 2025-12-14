# PromptCoin Database Cleanup Instructions

This guide will help you remove all PromptCoin economy infrastructure from your Supabase database.

## 📋 What Will Be Removed

- ✅ PromptCoin credit columns from `profiles` table:
  - `credits_analysis`
  - `credits_enhancement`
  - `credits_exam`
  - `credits_export`
  - `credits_templates`
  - `promptcoins`

- ✅ `promptcoin_transactions` table (entire table dropped)

- ✅ All PromptCoin-related functions:
  - `log_promptcoin_transaction()`
  - `purchase_smart_prompt_with_pc()`
  - `calculate_promptcoin_balance()`
  - `update_promptcoin_balance()`

- ✅ PromptCoin-related constraints and indexes

- ✅ Views and triggers related to PromptCoins

## 📊 What Will Be Added/Updated

- ✅ Direct USD payment tracking in `smart_prompt_purchases`
- ✅ `seller_earnings_summary` view (USD-based earnings)
- ✅ `increment_download_count()` helper function
- ✅ Updated RLS policies for USD payments

---

## 🚀 Option 1: Using Supabase Dashboard (Recommended - Easiest)

This is the **safest and easiest** method.

### Steps:

1. **Go to your Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your Promptopotamus project

2. **Open the SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and paste the migration**
   - Open: `supabase/migrations/20251116000000_final_promptcoin_cleanup.sql`
   - Copy all contents
   - Paste into the SQL Editor

4. **Run the migration**
   - Click "Run" button (or press Cmd/Ctrl + Enter)
   - Wait for completion (should take 5-30 seconds)

5. **Verify success**
   - You should see "Success. No rows returned" or similar
   - Check the "Notices" section for migration completion message

---

## 🚀 Option 2: Using psql Command Line

If you have PostgreSQL client (`psql`) installed:

### Steps:

1. **Get your database password**
   - Go to Supabase Dashboard → Settings → Database
   - Note your database password (or reset it if needed)

2. **Set environment variable**
   ```bash
   export SUPABASE_DB_PASSWORD="your_password_here"
   ```

3. **Run the script**
   ```bash
   cd /Users/rathan/MyProjects/companywebsites/promptopotamus
   ./scripts/apply-promptcoin-cleanup.sh
   ```

4. **Review output**
   - Check `migration-output.log` for details
   - Verify success messages

---

## 🚀 Option 3: Using Node.js Script

If you prefer using the Supabase JavaScript client:

### Steps:

1. **Install dependencies** (if not already installed)
   ```bash
   npm install @supabase/supabase-js dotenv
   ```

2. **Run the script**
   ```bash
   npx ts-node scripts/apply-migration-via-supabase-api.ts
   ```

   Or with tsx:
   ```bash
   npx tsx scripts/apply-migration-via-supabase-api.ts
   ```

3. **Review output**
   - The script will execute each SQL statement
   - Watch for success/error messages

---

## ⚠️ Before You Run

### 1. **Backup Your Database (Recommended)**

While this migration uses `DROP IF EXISTS` for safety, it's always good practice to backup:

```bash
# Using Supabase CLI
supabase db dump -f backup-before-promptcoin-cleanup.sql

# Or via Dashboard: Database → Backups → Create Backup
```

### 2. **Check Current Database State**

Run this query in Supabase SQL Editor to see what will be affected:

```sql
-- Check if PromptCoin columns exist
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name LIKE '%credit%' OR column_name = 'promptcoins';

-- Check if promptcoin_transactions table exists
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_name = 'promptcoin_transactions'
);

-- Count existing purchases
SELECT payment_provider, COUNT(*)
FROM smart_prompt_purchases
GROUP BY payment_provider;
```

---

## ✅ After Running the Migration

### 1. **Verify the Changes**

Run these queries in Supabase SQL Editor:

```sql
-- Verify PromptCoin columns are gone
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND (column_name LIKE '%credit%' OR column_name = 'promptcoins');
-- Should return 0 rows

-- Verify new view exists
SELECT * FROM seller_earnings_summary LIMIT 5;

-- Verify smart_prompt_purchases structure
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'smart_prompt_purchases'
ORDER BY ordinal_position;
```

### 2. **Test the Application**

1. ✅ Test Smart Prompt purchases with Stripe
2. ✅ Test Smart Prompt purchases with PayPal
3. ✅ Verify purchase history displays correctly
4. ✅ Check seller earnings calculations
5. ✅ Test free prompt downloads

### 3. **Deploy Updated Code**

The codebase has already been updated to remove PromptCoin references. Deploy when ready:

```bash
git add .
git commit -m "Remove PromptCoin economy - switch to direct USD payments"
git push origin main
```

Vercel will automatically deploy the changes.

---

## 🔧 Troubleshooting

### Error: "column does not exist"
This is **normal** - it means the column was already removed. The migration uses `DROP IF EXISTS` for safety.

### Error: "function does not exist"
Also **normal** - means the function was never created or already removed.

### Error: "permission denied"
Make sure you're using the Service Role key, not the anon key. Check your `.env.local`:
```
SUPABASE_SERVICE_ROLE_KEY=eyJ... (should start with eyJ)
```

### Migration hangs or times out
- The migration should complete in under 30 seconds
- If it hangs, check your database connection
- Try the Supabase Dashboard method instead

---

## 📞 Need Help?

If you encounter issues:

1. Check the migration output/logs
2. Verify your Supabase connection details
3. Try running individual sections of the migration manually
4. Contact support with the error messages

---

## 🎯 Summary

**What you're doing:**
- Removing an unused PromptCoin virtual currency system
- Switching to direct USD payments for Smart Prompts
- Simplifying the payment architecture

**Impact:**
- ✅ Cleaner database schema
- ✅ Simpler payment flow
- ✅ No user data loss (purchases preserved)
- ✅ Easier to maintain going forward

**Time required:**
- 5-10 minutes total
- Most of that is verification/testing

---

**Good luck! The migration is safe and reversible via database backups.** 🚀
