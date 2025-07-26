import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';

// Claude integration service for Promptopotamus
export class ClaudeIntegrationService {
  private anthropic: Anthropic;
  private supabase: ReturnType<typeof createClient>;

  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });

    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
  }

  /**
   * Analyze database performance and suggest optimizations
   */
  async analyzeDatabasePerformance(tableFilter?: string) {
    try {
      // Get database metrics
      const metrics = await this.getDatabaseMetrics(tableFilter);
      
      const prompt = `
        Analyze the following database performance metrics for the Promptopotamus platform:
        
        ${JSON.stringify(metrics, null, 2)}
        
        Please provide:
        1. Performance analysis and bottlenecks
        2. Specific optimization recommendations
        3. Index suggestions if needed
        4. Query optimization opportunities
        5. Security considerations
        
        Focus on the PromptCoin economy tables and payment system performance.
      `;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      return {
        success: true,
        analysis: response.content[0].type === 'text' ? response.content[0].text : 'Analysis completed',
        metrics
      };
    } catch (error) {
      console.error('Database analysis error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get security insights and recommendations
   */
  async getSecurityInsights(timeRange: string = '24 hours') {
    try {
      // Get security events
      const { data: securityEvents, error } = await this.supabase
        .from('payment_security_events')
        .select('*')
        .gte('created_at', new Date(Date.now() - this.parseTimeRange(timeRange)).toISOString())
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      const prompt = `
        Analyze these security events from the Promptopotamus payment system:
        
        ${JSON.stringify(securityEvents, null, 2)}
        
        Please provide:
        1. Security threat analysis
        2. Risk assessment for each event type
        3. Recommendations for improving security
        4. Potential attack patterns identified
        5. Suggested monitoring enhancements
        
        Focus on payment security and fraud prevention.
      `;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      return {
        success: true,
        insights: response.content[0].type === 'text' ? response.content[0].text : 'Analysis completed',
        eventCount: securityEvents?.length || 0,
        timeRange
      };
    } catch (error) {
      console.error('Security analysis error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Analyze PromptCoin transaction patterns
   */
  async analyzePromptCoinPatterns(timeRange: string = '7 days') {
    try {
      // Get transaction data
      const { data: transactions, error } = await this.supabase
        .from('promptcoin_transactions')
        .select('*')
        .gte('created_at', new Date(Date.now() - this.parseTimeRange(timeRange)).toISOString())
        .order('created_at', { ascending: false })
        .limit(1000);

      if (error) throw error;

      // Calculate basic statistics
      const stats = this.calculateTransactionStats(transactions || []);

      const prompt = `
        Analyze these PromptCoin transaction patterns for the Promptopotamus platform:
        
        Transaction Data:
        ${JSON.stringify(transactions?.slice(0, 20), null, 2)}
        
        Statistics:
        ${JSON.stringify(stats, null, 2)}
        
        Please provide:
        1. Transaction pattern analysis
        2. User behavior insights
        3. Economy health assessment
        4. Revenue optimization suggestions
        5. Potential issues or anomalies
        6. Recommendations for improving the PromptCoin economy
        
        Focus on marketplace dynamics and user engagement.
      `;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      return {
        success: true,
        analysis: response.content[0].type === 'text' ? response.content[0].text : 'Analysis completed',
        statistics: stats,
        transactionCount: transactions?.length || 0
      };
    } catch (error) {
      console.error('Transaction analysis error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate code optimization suggestions
   */
  async optimizeCode(filePath: string, codeContent: string, context?: string) {
    try {
      const prompt = `
        Review and optimize this TypeScript/React code from the Promptopotamus platform:
        
        File: ${filePath}
        Context: ${context || 'General optimization request'}
        
        Code:
        \`\`\`typescript
        ${codeContent}
        \`\`\`
        
        Please provide:
        1. Performance optimization suggestions
        2. Security improvements
        3. TypeScript best practices
        4. React/Next.js specific optimizations
        5. Database query optimizations if applicable
        6. Accessibility improvements
        
        Follow the project standards defined in CLAUDE.md.
      `;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 3000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      return {
        success: true,
        suggestions: response.content[0].type === 'text' ? response.content[0].text : 'Optimization completed',
        filePath
      };
    } catch (error) {
      console.error('Code optimization error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get database metrics for analysis
   */
  private async getDatabaseMetrics(tableFilter?: string) {
    const tables = ['profiles', 'smart_prompt_purchases', 'promptcoin_transactions', 'payment_security_events'];
    const metrics: any = {};

    for (const table of tables) {
      if (tableFilter && !table.includes(tableFilter)) continue;

      try {
        // Get row count
        const { count } = await this.supabase
          .from(table)
          .select('*', { count: 'exact', head: true });

        // Get recent activity (last 24 hours)
        const { count: recentCount } = await this.supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

        metrics[table] = {
          totalRows: count || 0,
          recentActivity: recentCount || 0,
          tableName: table
        };
      } catch (error) {
        metrics[table] = {
          error: 'Could not fetch metrics',
          tableName: table
        };
      }
    }

    return metrics;
  }

  /**
   * Calculate transaction statistics
   */
  private calculateTransactionStats(transactions: any[]) {
    const stats = {
      totalTransactions: transactions.length,
      totalVolume: 0,
      avgTransactionAmount: 0,
      transactionTypes: {} as Record<string, number>,
      hourlyDistribution: {} as Record<string, number>
    };

    transactions.forEach(tx => {
      stats.totalVolume += Math.abs(tx.amount);
      
      // Count transaction types
      stats.transactionTypes[tx.transaction_type] = 
        (stats.transactionTypes[tx.transaction_type] || 0) + 1;
      
      // Hour distribution
      const hour = new Date(tx.created_at).getHours();
      stats.hourlyDistribution[hour] = (stats.hourlyDistribution[hour] || 0) + 1;
    });

    stats.avgTransactionAmount = stats.totalVolume / Math.max(stats.totalTransactions, 1);

    return stats;
  }

  /**
   * Generate database migration from natural language description
   */
  async generateMigration(params: {
    description: string;
    requirements?: string;
    tableNames?: string[];
    migrationName?: string;
  }) {
    try {
      // Get current schema information
      const schemaInfo = await this.getSchemaInfo(params.tableNames);
      
      const prompt = `
        Generate a PostgreSQL migration for the Promptopotamus platform based on this description:
        
        **Description:** ${params.description}
        
        ${params.requirements ? `**Requirements:** ${params.requirements}` : ''}
        
        **Current Schema Context:**
        ${JSON.stringify(schemaInfo, null, 2)}
        
        **Migration Guidelines:**
        1. Use proper PostgreSQL syntax and best practices
        2. Include IF NOT EXISTS clauses where appropriate
        3. Add proper indexes for performance
        4. Include RLS (Row Level Security) policies if needed
        5. Use TIMESTAMPTZ for timestamps
        6. Follow the existing naming conventions
        7. Include rollback-friendly changes
        8. Add comments explaining complex operations
        
        **Required Format:**
        - Provide ONLY the SQL migration content
        - Start with descriptive comments
        - Use proper transaction boundaries if needed
        - Include any necessary indexes
        - Add appropriate constraints
        
        **Existing Tables to Consider:**
        - profiles (user data with promptcoins, credits, subscription info)
        - smart_prompt_purchases (purchase history)
        - promptcoin_transactions (audit trail)
        - payment_security_events (security logging)
        - affiliate_resources (admin-managed resources)
        - smart_prompt_reviews (user reviews and ratings)
        - user_follows (social features)
        - learning_sessions (analytics)
        
        Generate clean, production-ready SQL migration code.
      `;

      const response = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 3000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });

      const migrationContent = response.content[0].type === 'text' ? response.content[0].text : '';
      
      // Generate migration name if not provided
      const finalMigrationName = params.migrationName || this.generateMigrationName(params.description);
      
      // Analyze migration for potential issues
      const warnings = this.analyzeMigrationSafety(migrationContent);

      return {
        success: true,
        migrationName: finalMigrationName,
        migrationContent,
        analysis: 'Migration generated successfully',
        warnings
      };
    } catch (error) {
      console.error('Migration generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get current schema information for context
   */
  private async getSchemaInfo(tableNames?: string[]) {
    try {
      const tables = tableNames || ['profiles', 'smart_prompt_purchases', 'promptcoin_transactions'];
      const schemaInfo: any = {};

      for (const table of tables) {
        try {
          // Get table schema information
          const { data: columns } = await this.supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable, column_default')
            .eq('table_name', table)
            .eq('table_schema', 'public');

          if (columns && columns.length > 0) {
            schemaInfo[table] = {
              columns: columns.map(col => ({
                name: col.column_name,
                type: col.data_type,
                nullable: col.is_nullable === 'YES',
                default: col.column_default
              }))
            };
          }
        } catch (error) {
          // Table might not exist, skip
          schemaInfo[table] = { error: 'Table not accessible or does not exist' };
        }
      }

      return schemaInfo;
    } catch (error) {
      return { error: 'Could not fetch schema information' };
    }
  }

  /**
   * Generate migration name from description
   */
  private generateMigrationName(description: string): string {
    return description
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '') // Remove special chars
      .replace(/\s+/g, '_') // Replace spaces with underscores
      .substring(0, 50) // Limit length
      .replace(/_+$/, ''); // Remove trailing underscores
  }

  /**
   * Analyze migration for potential safety issues
   */
  private analyzeMigrationSafety(migrationContent: string): string[] {
    const warnings: string[] = [];
    const content = migrationContent.toLowerCase();

    // Check for potentially dangerous operations
    if (content.includes('drop table')) {
      warnings.push('⚠️ Contains DROP TABLE - This will permanently delete data');
    }
    
    if (content.includes('drop column')) {
      warnings.push('⚠️ Contains DROP COLUMN - This will permanently delete column data');
    }
    
    if (content.includes('alter column') && content.includes('not null')) {
      warnings.push('⚠️ Adding NOT NULL constraint - Ensure existing data compatibility');
    }
    
    if (content.includes('truncate')) {
      warnings.push('⚠️ Contains TRUNCATE - This will delete all table data');
    }
    
    if (content.includes('delete from') && !content.includes('where')) {
      warnings.push('⚠️ Contains DELETE without WHERE - This may delete all rows');
    }

    if (!content.includes('if not exists') && content.includes('create table')) {
      warnings.push('ℹ️ Consider using IF NOT EXISTS for CREATE TABLE statements');
    }

    if (content.includes('create index') && !content.includes('if not exists')) {
      warnings.push('ℹ️ Consider using IF NOT EXISTS for CREATE INDEX statements');
    }

    return warnings;
  }

  /**
   * Parse time range string to milliseconds
   */
  private parseTimeRange(timeRange: string): number {
    const value = parseInt(timeRange);
    const unit = timeRange.toLowerCase();

    if (unit.includes('hour')) return value * 60 * 60 * 1000;
    if (unit.includes('day')) return value * 24 * 60 * 60 * 1000;
    if (unit.includes('week')) return value * 7 * 24 * 60 * 60 * 1000;
    
    // Default to 24 hours
    return 24 * 60 * 60 * 1000;
  }
}

// Export singleton instance
export const claudeIntegration = new ClaudeIntegrationService();