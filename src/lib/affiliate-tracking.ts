import { createClient } from '@/lib/supabase/client';
import { createServerClient } from '@/lib/supabase/server';

export interface AffiliatePartner {
  id: string;
  partner_key: string;
  partner_name: string;
  base_url: string;
  commission_rate: number;
  cookie_duration_days: number;
  tracking_method: string;
  is_active: boolean;
}

export interface AffiliateClick {
  id?: string;
  user_id?: string;
  partner_id: string;
  click_source: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer_url?: string;
  user_agent?: string;
  ip_address?: string;
  session_id: string;
}

export interface AffiliateConversion {
  click_id: string;
  user_id?: string;
  partner_id: string;
  conversion_value: number;
  commission_earned: number;
  conversion_type: string;
  external_transaction_id?: string;
}

/**
 * Affiliate Tracking Utility Class
 */
export class AffiliateTracker {
  private supabase;
  private isServer: boolean;

  constructor(isServer = false) {
    this.supabase = isServer ? createServerClient() : createClient();
    this.isServer = isServer;
  }

  /**
   * Generate affiliate tracking URL
   */
  async generateAffiliateUrl(
    partnerKey: string,
    source: string,
    userId?: string,
    customParams?: Record<string, string>
  ): Promise<string | null> {
    try {
      // Get partner details
      const { data: partner } = await this.supabase
        .from('affiliate_partners')
        .select('*')
        .eq('partner_key', partnerKey)
        .eq('is_active', true)
        .single();

      if (!partner) {
        console.warn(`Affiliate partner '${partnerKey}' not found or inactive`);
        return null;
      }

      // Generate session ID for tracking
      const sessionId = this.generateSessionId();

      // Track the click intent (before actual click)
      await this.trackClick({
        user_id: userId,
        partner_id: partner.id,
        click_source: source,
        utm_source: 'promptopotamus',
        utm_medium: 'contextual',
        utm_campaign: source,
        utm_term: partnerKey,
        utm_content: customParams?.content || source,
        session_id: sessionId,
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
        referrer_url: typeof document !== 'undefined' ? document.referrer : undefined
      });

      // Build tracking URL
      const trackingParams = new URLSearchParams({
        utm_source: 'promptopotamus',
        utm_medium: 'contextual',
        utm_campaign: source,
        utm_term: partnerKey,
        utm_content: customParams?.content || source,
        ref: 'promptopotamus',
        session_id: sessionId,
        ...customParams
      });

      return `${partner.base_url}?${trackingParams.toString()}`;
    } catch (error) {
      console.error('Error generating affiliate URL:', error);
      return null;
    }
  }

  /**
   * Track affiliate click
   */
  async trackClick(clickData: AffiliateClick): Promise<string | null> {
    try {
      const { data, error } = await this.supabase
        .from('affiliate_clicks')
        .insert([{
          user_id: clickData.user_id,
          partner_id: clickData.partner_id,
          click_source: clickData.click_source,
          utm_source: clickData.utm_source,
          utm_medium: clickData.utm_medium,
          utm_campaign: clickData.utm_campaign,
          utm_term: clickData.utm_term,
          utm_content: clickData.utm_content,
          referrer_url: clickData.referrer_url,
          user_agent: clickData.user_agent,
          ip_address: clickData.ip_address,
          session_id: clickData.session_id
        }])
        .select('id')
        .single();

      if (error) {
        console.error('Error tracking affiliate click:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Error tracking affiliate click:', error);
      return null;
    }
  }

  /**
   * Record affiliate conversion
   */
  async recordConversion(conversionData: AffiliateConversion): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('affiliate_conversions')
        .insert([{
          click_id: conversionData.click_id,
          user_id: conversionData.user_id,
          partner_id: conversionData.partner_id,
          conversion_value: conversionData.conversion_value,
          commission_earned: conversionData.commission_earned,
          conversion_type: conversionData.conversion_type,
          external_transaction_id: conversionData.external_transaction_id
        }]);

      if (error) {
        console.error('Error recording affiliate conversion:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error recording affiliate conversion:', error);
      return false;
    }
  }

  /**
   * Get contextual affiliate recommendations
   */
  async getContextualRecommendations(
    context: 'prompt_creation' | 'marketplace_browse' | 'certificate_earned',
    userTags?: string[],
    promptCategory?: string
  ): Promise<AffiliatePartner[]> {
    try {
      // Get active partners
      const { data: partners, error } = await this.supabase
        .from('affiliate_partners')
        .select('*')
        .eq('is_active', true);

      if (error || !partners) {
        console.error('Error fetching affiliate partners:', error);
        return [];
      }

      // Filter and sort based on context
      return partners.filter(partner => {
        switch (context) {
          case 'prompt_creation':
            return ['openai', 'anthropic', 'jasper'].includes(partner.partner_key);
          case 'marketplace_browse':
            return true; // All partners relevant for marketplace
          case 'certificate_earned':
            return ['openai', 'anthropic'].includes(partner.partner_key); // Premium tools
          default:
            return true;
        }
      }).sort((a, b) => {
        // Prioritize by commission rate and context relevance
        return (b.commission_rate - a.commission_rate);
      });
    } catch (error) {
      console.error('Error getting contextual recommendations:', error);
      return [];
    }
  }

  /**
   * Get affiliate performance analytics
   */
  async getAffiliateAnalytics(partnerId?: string, dateRange = 30) {
    try {
      const dateFilter = new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000).toISOString();
      
      let query = this.supabase
        .from('affiliate_conversions')
        .select(`
          *,
          affiliate_partners!affiliate_conversions_partner_id_fkey(partner_name, partner_key),
          affiliate_clicks!affiliate_conversions_click_id_fkey(click_source, utm_campaign)
        `)
        .gte('converted_at', dateFilter);

      if (partnerId) {
        query = query.eq('partner_id', partnerId);
      }

      const { data: conversions, error } = await query;

      if (error) {
        console.error('Error fetching affiliate analytics:', error);
        return null;
      }

      // Calculate metrics
      const totalConversions = conversions?.length || 0;
      const totalRevenue = conversions?.reduce((sum, conv) => sum + (conv.conversion_value || 0), 0) || 0;
      const totalCommission = conversions?.reduce((sum, conv) => sum + (conv.commission_earned || 0), 0) || 0;

      // Group by source
      const sourceAnalytics = conversions?.reduce((acc, conv) => {
        const source = conv.affiliate_clicks?.click_source || 'unknown';
        if (!acc[source]) {
          acc[source] = { conversions: 0, revenue: 0, commission: 0 };
        }
        acc[source].conversions++;
        acc[source].revenue += conv.conversion_value || 0;
        acc[source].commission += conv.commission_earned || 0;
        return acc;
      }, {} as Record<string, { conversions: number; revenue: number; commission: number }>);

      return {
        totalConversions,
        totalRevenue,
        totalCommission,
        averageOrderValue: totalConversions > 0 ? totalRevenue / totalConversions : 0,
        sourceAnalytics: sourceAnalytics || {}
      };
    } catch (error) {
      console.error('Error getting affiliate analytics:', error);
      return null;
    }
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2)}`;
  }
}

/**
 * Contextual affiliate integration helpers
 */
export const AffiliateContexts = {
  // Prompt creation workflow
  PROMPT_CREATION: {
    source: 'prompt_creation',
    triggers: [
      { 
        partner: 'openai', 
        message: 'Perfect for ChatGPT! Try with OpenAI API for best results.',
        context: ['ai-assistant', 'chatbot', 'text-generation']
      },
      { 
        partner: 'anthropic', 
        message: 'Optimize with Claude for more nuanced responses.',
        context: ['analysis', 'research', 'complex-reasoning']
      },
      { 
        partner: 'jasper', 
        message: 'Great for marketing! Enhance with Jasper AI.',
        context: ['marketing', 'copywriting', 'content-creation']
      }
    ]
  },

  // Certificate achievement
  CERTIFICATE_EARNED: {
    source: 'certificate_earned',
    triggers: [
      {
        partner: 'openai',
        message: 'Ready for advanced prompting? Unlock ChatGPT Plus features.',
        context: ['level-2', 'level-3']
      },
      {
        partner: 'anthropic',
        message: 'Master-level prompting calls for Claude Pro capabilities.',
        context: ['level-3']
      }
    ]
  },

  // Marketplace browsing
  MARKETPLACE_BROWSE: {
    source: 'marketplace_browse',
    triggers: [
      {
        partner: 'openai',
        message: 'This prompt works amazingly with ChatGPT Plus!',
        context: ['high-rated', 'complex-prompts']
      }
    ]
  }
};

/**
 * Server-side affiliate tracking for API routes
 */
export async function trackAffiliateClickServer(
  partnerKey: string,
  source: string,
  userId?: string,
  request?: Request
): Promise<string | null> {
  const tracker = new AffiliateTracker(true);
  
  // Extract request metadata
  const userAgent = request?.headers.get('user-agent') || undefined;
  const referrer = request?.headers.get('referer') || undefined;
  const forwardedFor = request?.headers.get('x-forwarded-for');
  const realIp = request?.headers.get('x-real-ip');
  const ipAddress = forwardedFor?.split(',')[0] || realIp || undefined;

  return tracker.generateAffiliateUrl(partnerKey, source, userId, {
    user_agent: userAgent,
    referrer_url: referrer,
    ip_address: ipAddress
  });
}

// Export singleton instance for client use
export const affiliateTracker = new AffiliateTracker(false);