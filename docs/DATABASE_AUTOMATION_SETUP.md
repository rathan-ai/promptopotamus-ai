# Automated Database Management Setup

This guide covers the complete automated database management system for Promptopotamus, enabling Claude to manage schema changes, migrations, and database operations.

## 🎯 What's Now Automated

### ✅ Completed Setup

1. **Supabase CLI Integration**
   - ✅ Supabase CLI installed via Homebrew
   - ✅ Project initialized with `supabase init`
   - ✅ Configuration file created (`supabase/config.toml`)
   - ✅ Migration directory structure set up

2. **Schema Consolidation**
   - ✅ All existing migrations consolidated into `supabase/migrations/20250726120000_consolidated_schema.sql`
   - ✅ Complete schema including payment system, social features, and security enhancements
   - ✅ Row Level Security (RLS) policies implemented
   - ✅ Database functions for payment management and security logging

3. **Claude AI Integration**
   - ✅ Natural language to SQL migration generator (`/api/claude/generate-migration`)
   - ✅ Automated migration deployment (`/api/claude/migrate-database`)
   - ✅ Enhanced database analysis with schema context
   - ✅ Migration safety analysis with warnings for dangerous operations

4. **Automation Scripts**
   - ✅ Database deployment script (`scripts/db-deploy.sh`)
   - ✅ NPM scripts for common database operations
   - ✅ GitHub Actions workflow for automated migrations
   - ✅ Safety checks and validation

## 🔧 Available Commands

### NPM Scripts
```bash
# Database status and management
npm run db:status      # List migration status
npm run db:push        # Deploy pending migrations
npm run db:pull        # Sync schema from remote
npm run db:reset       # Reset local development database
npm run db:diff        # Show schema differences
npm run db:generate    # Create new migration file

# Supabase local development
npm run supabase:start # Start local Supabase instance
npm run supabase:stop  # Stop local Supabase instance
npm run supabase:link  # Link to remote project
```

### Direct Script Usage
```bash
# Safe migration deployment (dry-run by default)
./scripts/db-deploy.sh --dry-run

# Deploy migrations with confirmation
./scripts/db-deploy.sh --apply

# Deploy without prompts (for automation)
./scripts/db-deploy.sh --apply --auto-approve

# Deploy without backup
./scripts/db-deploy.sh --apply --no-backup
```

### Claude AI Integration
```bash
# Generate migration from natural language
curl -X POST "http://localhost:3000/api/claude/generate-migration" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Add user notification preferences table",
    "requirements": "Include email, SMS, push notification settings",
    "migrationName": "add_notification_preferences"
  }'

# Deploy generated migration
curl -X POST "http://localhost:3000/api/claude/migrate-database" \
  -H "Content-Type: application/json" \
  -d '{
    "migrationName": "add_notification_preferences",
    "migrationContent": "CREATE TABLE user_notifications...",
    "dryRun": false
  }'
```

## 🔗 Required Setup Steps

### 1. Link Supabase CLI to Remote Project

**You need to complete this step:**

```bash
# Get your Supabase access token from https://supabase.com/dashboard/account/tokens
export SUPABASE_ACCESS_TOKEN="your-access-token-here"

# Link to your remote project
supabase link --project-ref qwjrknwzhqymocoikwze
```

### 2. Configure Repository Secrets

Add these secrets to your GitHub repository settings:

#### Required Secrets
```bash
# Supabase
SUPABASE_ACCESS_TOKEN=your-supabase-access-token
SUPABASE_PROJECT_ID=qwjrknwzhqymocoikwze

# Production (if different from staging)
SUPABASE_PRODUCTION_ACCESS_TOKEN=your-production-token
SUPABASE_PRODUCTION_PROJECT_ID=your-production-project-id

# Claude AI
ANTHROPIC_API_KEY=your-anthropic-api-key

# Other integrations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VERCEL_TOKEN=your-vercel-token
```

### 3. Environment Variables for Local Development

Add to your `.env.local`:
```bash
# Claude Integration
ANTHROPIC_API_KEY=your-anthropic-api-key

# Supabase (for CLI operations)
SUPABASE_ACCESS_TOKEN=your-access-token
```

## 🤖 How Claude Can Now Help You

### 1. Generate Migrations from Natural Language

**Example:** "Add a feature flag system to control new features"

Claude will:
- Analyze your current schema
- Generate proper PostgreSQL migration
- Include safety warnings for dangerous operations
- Follow your existing naming conventions
- Add appropriate indexes and constraints

### 2. Automated Schema Management

**Example:** "I need to add cryptocurrency payment support"

Claude can:
- Create tables for crypto wallets and transactions
- Add fields to existing payment tables
- Generate proper foreign key relationships
- Include security considerations
- Add audit trails

### 3. Database Performance Analysis

**Example:** "Why are my marketplace queries slow?"

Claude will:
- Analyze database metrics
- Identify bottlenecks
- Suggest index optimizations
- Recommend query improvements
- Provide implementation steps

### 4. Security Monitoring

**Example:** "Check for unusual payment activity"

Claude can:
- Analyze security events
- Identify suspicious patterns
- Suggest security improvements
- Generate alerts for anomalies
- Recommend policy changes

## 🚀 GitHub Actions Automation

### Automatic Migration Validation
- Runs on every PR with migration changes
- Validates SQL syntax and safety
- Provides Claude analysis of changes
- Comments on PR with recommendations

### Staged Deployment
- **Staging:** Auto-deploys on main branch push
- **Production:** Manual trigger with approval gates
- **Rollback:** Maintains backup and rollback capabilities

### Safety Features
- Dry-run validation before deployment
- Dangerous operation detection
- Manual approval gates for production
- Comprehensive logging and monitoring

## 📋 Migration Examples

### Example 1: Add User Preferences
```bash
# Using Claude API
curl -X POST "http://localhost:3000/api/claude/generate-migration" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Add user preferences table for UI customization",
    "requirements": "Theme settings, language preference, notification settings",
    "tableNames": ["user_preferences"],
    "migrationName": "add_user_preferences"
  }'
```

### Example 2: Enhance Payment System
```bash
# Using natural language via Claude
curl -X POST "http://localhost:3000/api/claude/generate-migration" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Add support for subscription trials and grace periods",
    "requirements": "Trial end date, grace period duration, trial conversion tracking",
    "tableNames": ["profiles", "smart_prompt_purchases"]
  }'
```

## 🔒 Security Features

### Row Level Security (RLS)
- All sensitive tables have RLS enabled
- Users can only access their own data
- Admin functions require service role
- Security events are automatically logged

### Audit Trail
- All marketplace purchases tracked
- Payment security events logged
- Migration deployments recorded
- User actions monitored

### Safety Mechanisms
- Migration validation before deployment
- Dangerous operation warnings
- Backup creation before production changes
- Rollback capabilities

## 🎛️ Advanced Features

### Local Development
```bash
# Start local Supabase for development
npm run supabase:start

# Reset local database to match migrations
npm run db:reset

# Generate new migration
npm run db:generate new_feature_name
```

### Production Monitoring
```bash
# Check production migration status
SUPABASE_ACCESS_TOKEN=$PROD_TOKEN npm run db:status

# Analyze recent security events
curl -X POST "https://yourapp.com/api/claude/security-insights" \
  -H "Content-Type: application/json" \
  -d '{"timeRange": "24 hours"}'
```

## 🛟 Troubleshooting

### Common Issues

1. **CLI Not Linked**
   ```bash
   Error: Project not linked
   Solution: Run `supabase link --project-ref your-project-id`
   ```

2. **Permission Denied**
   ```bash
   Error: Access token not valid
   Solution: Check SUPABASE_ACCESS_TOKEN environment variable
   ```

3. **Migration Conflicts**
   ```bash
   Error: Migration already exists
   Solution: Use `supabase migration list` to check status
   ```

### Getting Help

1. **Claude Integration Issues**: Check API endpoint documentation at `/api/claude/*`
2. **Supabase CLI Issues**: Run `supabase --help` or check the [official docs](https://supabase.com/docs/guides/cli)
3. **GitHub Actions Issues**: Check workflow logs in Actions tab
4. **Database Issues**: Use the security insights endpoint for analysis

## 🎉 What You Can Do Now

With this setup, you can:

1. **Ask Claude for Schema Changes**
   - "Add a rating system for AI models"
   - "Create a subscription renewal workflow"
   - "Add audit logging for user actions"

2. **Automate Database Management**
   - Push migrations via GitHub
   - Monitor database performance
   - Track security events

3. **Generate Migrations Naturally**
   - Describe what you want in plain English
   - Get production-ready SQL
   - Deploy with safety checks

4. **Maintain Database Health**
   - Regular performance analysis
   - Security monitoring
   - Automated backups

The system is now ready for you to manage your database schema changes through natural language interactions with Claude, with full automation and safety features in place!

---

**Next Steps:**
1. Get a Supabase access token and link your project
2. Configure GitHub repository secrets
3. Test the Claude integration endpoints
4. Create your first AI-generated migration!