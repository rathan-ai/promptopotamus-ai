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