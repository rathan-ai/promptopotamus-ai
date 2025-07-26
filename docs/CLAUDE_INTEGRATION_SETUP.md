# Claude Code Integration Setup Guide

This guide walks you through integrating Claude Code with your Promptopotamus platform to enable AI-powered development assistance.

## Prerequisites

- GitHub repository access with admin permissions
- Anthropic API key or cloud provider access (AWS Bedrock, Google Vertex AI)
- Supabase project with service role key
- Vercel project with API token

## Phase 1: GitHub Actions Integration

### Step 1: Install Claude GitHub App

1. Go to the [Claude GitHub App](https://github.com/apps/claude-ai)
2. Click "Install" and select your repository
3. Grant necessary permissions for repository access

### Step 2: Configure Repository Secrets

Navigate to your GitHub repository settings and add these secrets:

#### Required Secrets
```bash
# Claude AI Configuration
ANTHROPIC_API_KEY=sk-ant-api03-...

# Supabase Integration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# Vercel Integration
VERCEL_TOKEN=your-vercel-token
```

#### Optional Secrets (for advanced features)
```bash
# AWS Bedrock (alternative to Anthropic API)
AWS_BEDROCK_ACCESS_KEY=AKIA...
AWS_BEDROCK_SECRET_KEY=...
AWS_BEDROCK_REGION=us-east-1

# Google Vertex AI (alternative to Anthropic API)
GOOGLE_APPLICATION_CREDENTIALS=path/to/credentials.json
VERTEX_AI_PROJECT_ID=your-project-id
```

### Step 3: Test GitHub Integration

1. Create a new issue in your repository
2. In the issue description, mention `@claude` and ask a question like:
   ```markdown
   @claude Can you help me optimize the database queries in the PromptCoin transaction system?
   ```
3. The GitHub Action should trigger and Claude will respond with analysis and suggestions

## Phase 2: Local Development Setup

### Step 1: Install Claude Code CLI

```bash
# Install via npm
npm install -g @anthropic-ai/claude-code

# Or using the installer
curl -fsSL https://claude.ai/install.sh | sh
```

### Step 2: Configure Claude Code

```bash
# Set your API key
claude-code config set api_key "your-anthropic-api-key"

# Configure project settings
claude-code config set project_name "Promptopotamus"
claude-code config set model "claude-3-5-sonnet-20241022"
```

### Step 3: Test Local Integration

```bash
# Navigate to your project directory
cd /path/to/promptopotamus

# Ask Claude for help
claude-code ask "How can I improve the security of the payment webhook handlers?"

# Analyze specific files
claude-code analyze src/lib/payment-adapter.ts
```

## Phase 3: MCP (Model Context Protocol) Setup

### Step 1: Install MCP Dependencies

```bash
# Install MCP packages
npm install @anthropic-ai/mcp-server @anthropic-ai/mcp-client

# Install database and platform clients
npm install @supabase/supabase-js @vercel/sdk
```

### Step 2: Configure Supabase MCP Server

1. The MCP configuration is already created in `mcp/supabase-server.json`
2. Set environment variables:
   ```bash
   export SUPABASE_URL="https://your-project.supabase.co"
   export SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
   ```

3. Start the MCP server:
   ```bash
   mcp-server start mcp/supabase-server.json
   ```

### Step 3: Configure Vercel MCP Server

1. The MCP configuration is already created in `mcp/vercel-server.json`
2. Set environment variables:
   ```bash
   export VERCEL_TOKEN="your-vercel-token"
   export VERCEL_PROJECT_ID="your-project-id"
   ```

3. Start the MCP server:
   ```bash
   mcp-server start mcp/vercel-server.json
   ```

## Phase 4: Advanced SDK Integration

### TypeScript SDK Integration

For building custom admin tools or AI-powered features directly into your app:

```typescript
// Example: AI-powered database analysis tool
import { ClaudeCode } from '@anthropic-ai/claude-code';

const claude = new ClaudeCode({
  apiKey: process.env.ANTHROPIC_API_KEY,
  model: 'claude-3-5-sonnet-20241022'
});

export async function analyzeDatabasePerformance() {
  const analysis = await claude.ask(
    "Analyze the current database performance and suggest optimizations for the PromptCoin transaction system",
    {
      context: {
        files: ['src/lib/subscription.ts', 'migrations/007_secure_payment_system.sql'],
        environment: 'production'
      }
    }
  );
  
  return analysis;
}
```

### Python SDK for Automation

For server-side monitoring and automation:

```python
# Example: Automated performance monitoring
from claude_code_sdk import ClaudeCode
import asyncio

claude = ClaudeCode(api_key="your-api-key")

async def monitor_system_health():
    response = await claude.ask(
        "Check the system health based on recent logs and metrics",
        context={
            "resources": ["supabase://metrics", "vercel://analytics"],
            "tools": ["get_security_events", "get_analytics"]
        }
    )
    
    # Process response and take actions
    if "critical" in response.lower():
        # Trigger alerts
        await send_alert(response)
    
    return response

# Run monitoring every hour
asyncio.run(monitor_system_health())
```

## Common Use Cases

### 1. Database Operations
```bash
# Ask Claude to analyze database performance
@claude Please analyze the performance of our PromptCoin transaction queries and suggest optimizations

# Request schema changes
@claude Can you create a migration to add user preferences table with proper RLS policies?

# Security audit
@claude Please audit our database security configuration and RLS policies
```

### 2. Deployment Issues
```bash
# Troubleshoot build failures
@claude The Vercel deployment is failing with TypeScript errors. Can you help fix them?

# Performance optimization
@claude Our Core Web Vitals scores are declining. Can you analyze and suggest improvements?

# Environment configuration
@claude Help me set up the correct environment variables for the new PayPal integration
```

### 3. Code Review and Quality
```bash
# Code review assistance
@claude Please review this payment webhook handler for security vulnerabilities

# Architecture questions
@claude What's the best way to implement real-time PromptCoin balance updates?

# Performance optimization
@claude Can you optimize this database query for better performance?
```

## Security Considerations

### API Key Management
- **Never commit API keys to your repository**
- Use GitHub Secrets for CI/CD
- Use environment variables for local development
- Rotate keys regularly

### Access Control
- Grant minimal necessary permissions
- Use read-only mode by default for database operations
- Require confirmation for destructive operations
- Enable audit logging for all AI-assisted changes

### Data Privacy
- Claude Code operates on your code locally or in your CI/CD pipeline
- Sensitive data (API keys, user data) is not sent to Claude unless explicitly shared
- Use the MCP protocol for secure, controlled access to external resources

## Troubleshooting

### Common Issues

1. **GitHub Action not triggering**
   - Check that the Claude GitHub App is installed
   - Verify the workflow file is in `.github/workflows/`
   - Ensure you're mentioning `@claude` in the issue/PR body

2. **API key errors**
   - Verify the API key is correctly set in GitHub Secrets
   - Check for typos in the secret name
   - Ensure the key has sufficient credits/permissions

3. **MCP server connection issues**
   - Verify environment variables are set correctly
   - Check network connectivity to Supabase/Vercel
   - Review MCP server logs for error details

4. **Permission errors**
   - Ensure service role key has necessary database permissions
   - Verify Vercel token has project access
   - Check GitHub App permissions

### Getting Help

1. **Documentation**: Check the [Claude Code docs](https://docs.anthropic.com/en/docs/claude-code)
2. **GitHub Issues**: Create issues in your repo mentioning `@claude` for help
3. **Community**: Join the Claude developer community for support
4. **Logs**: Check GitHub Action logs, Vercel deployment logs, and Supabase logs for details

## Next Steps

Once you have Claude Code integrated:

1. **Start Small**: Begin with simple questions and code reviews
2. **Build Trust**: Gradually use Claude for more complex tasks as you gain confidence
3. **Customize**: Modify the MCP configurations to match your specific workflow
4. **Automate**: Set up automated monitoring and maintenance tasks
5. **Scale**: Expand integration to other repositories and team members

Remember: Claude Code is a powerful assistant, but always review and test its suggestions before applying them to production systems.

---

*For the most up-to-date information, refer to the [official Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code).*