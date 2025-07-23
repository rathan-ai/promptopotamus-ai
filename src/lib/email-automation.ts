'use client';

import { createClient } from '@/lib/supabase/client';

export interface EmailCampaign {
  id: string;
  campaign_key: string;
  campaign_name: string;
  campaign_type: 'weekly' | 'triggered' | 'one_time';
  subject_template: string;
  html_template: string;
  text_template?: string;
  trigger_criteria?: any;
  send_schedule?: {
    day_of_week: number; // 0 = Sunday, 1 = Monday, etc.
    hour: number; // 0-23
  };
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailSend {
  id: string;
  user_id: string;
  campaign_id: string;
  email_address: string;
  subject: string;
  status: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
  external_message_id?: string;
  sent_at: string;
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  error_message?: string;
}

export interface UserEmailPreferences {
  id: string;
  user_id: string;
  weekly_digest: boolean;
  achievement_notifications: boolean;
  marketplace_updates: boolean;
  affiliate_recommendations: boolean;
  marketing_emails: boolean;
  unsubscribed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

/**
 * Email Automation System
 */
export class EmailAutomation {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Send email campaign to user
   */
  async sendCampaignEmail(
    userId: string,
    campaignKey: string,
    templateData: Record<string, any> = {},
    customEmail?: string
  ): Promise<boolean> {
    try {
      // Get campaign details
      const { data: campaign, error: campaignError } = await this.supabase
        .from('email_campaigns')
        .select('*')
        .eq('campaign_key', campaignKey)
        .eq('is_active', true)
        .single();

      if (campaignError || !campaign) {
        console.error('Campaign not found:', campaignKey, campaignError);
        return false;
      }

      // Get user details and email preferences
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('name, email')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        console.error('User profile not found:', userId, profileError);
        return false;
      }

      // Check email preferences
      const canSendEmail = await this.canSendEmailToUser(userId, campaign.campaign_type);
      if (!canSendEmail) {
        console.log('User has opted out of this email type:', userId, campaign.campaign_type);
        return false;
      }

      const emailAddress = customEmail || profile.email;
      
      // Check if we've already sent this campaign recently (for weekly/triggered emails)
      if (campaign.campaign_type !== 'one_time') {
        const recentSend = await this.hasRecentSend(userId, campaign.id, campaign.campaign_type);
        if (recentSend) {
          console.log('Email already sent recently:', userId, campaignKey);
          return false;
        }
      }

      // Generate email content
      const emailContent = this.generateEmailContent(
        campaign,
        {
          user_name: profile.name,
          user_email: emailAddress,
          ...templateData
        }
      );

      // Send email via your preferred email service
      const sendResult = await this.sendEmail(
        emailAddress,
        emailContent.subject,
        emailContent.html,
        emailContent.text
      );

      if (sendResult.success) {
        // Log the email send
        await this.logEmailSend({
          user_id: userId,
          campaign_id: campaign.id,
          email_address: emailAddress,
          subject: emailContent.subject,
          status: 'sent',
          external_message_id: sendResult.messageId
        });

        return true;
      } else {
        // Log failed send
        await this.logEmailSend({
          user_id: userId,
          campaign_id: campaign.id,
          email_address: emailAddress,
          subject: emailContent.subject,
          status: 'failed',
          error_message: sendResult.error
        });

        return false;
      }
    } catch (error) {
      console.error('Error sending campaign email:', error);
      return false;
    }
  }

  /**
   * Send weekly digest to all eligible users
   */
  async sendWeeklyDigest(): Promise<{ sent: number; failed: number }> {
    try {
      // Get all users who haven't unsubscribed from weekly digest
      const { data: eligibleUsers, error } = await this.supabase
        .from('profiles')
        .select(`
          id, name, email,
          user_email_preferences!user_email_preferences_user_id_fkey(weekly_digest, unsubscribed_at)
        `)
        .is('user_email_preferences.unsubscribed_at', null)
        .eq('user_email_preferences.weekly_digest', true);

      if (error || !eligibleUsers) {
        console.error('Error fetching eligible users:', error);
        return { sent: 0, failed: 0 };
      }

      let sent = 0;
      let failed = 0;

      for (const user of eligibleUsers) {
        // Generate personalized digest data
        const digestData = await this.generateWeeklyDigestData(user.id);
        
        const success = await this.sendCampaignEmail(
          user.id,
          'weekly_digest',
          digestData
        );

        if (success) {
          sent++;
        } else {
          failed++;
        }

        // Add small delay to avoid overwhelming email service
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      return { sent, failed };
    } catch (error) {
      console.error('Error sending weekly digest:', error);
      return { sent: 0, failed: 0 };
    }
  }

  /**
   * Send achievement notification
   */
  async sendAchievementNotification(
    userId: string,
    achievementName: string,
    achievementDescription: string,
    xpEarned: number
  ): Promise<boolean> {
    return this.sendCampaignEmail(
      userId,
      'achievement_earned',
      {
        achievement_name: achievementName,
        achievement_description: achievementDescription,
        xp_earned: xpEarned
      }
    );
  }

  /**
   * Update user email preferences
   */
  async updateEmailPreferences(
    userId: string,
    preferences: Partial<UserEmailPreferences>
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_email_preferences')
        .upsert([{
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Error updating email preferences:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating email preferences:', error);
      return false;
    }
  }

  /**
   * Unsubscribe user from all emails
   */
  async unsubscribeUser(userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('user_email_preferences')
        .upsert([{
          user_id: userId,
          weekly_digest: false,
          achievement_notifications: false,
          marketplace_updates: false,
          affiliate_recommendations: false,
          marketing_emails: false,
          unsubscribed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Error unsubscribing user:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error unsubscribing user:', error);
      return false;
    }
  }

  /**
   * Get user email preferences
   */
  async getUserEmailPreferences(userId: string): Promise<UserEmailPreferences | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_email_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching email preferences:', error);
        return null;
      }

      return data || this.createDefaultEmailPreferences(userId);
    } catch (error) {
      console.error('Error getting email preferences:', error);
      return null;
    }
  }

  /**
   * Generate weekly digest data for user
   */
  private async generateWeeklyDigestData(userId: string): Promise<Record<string, any>> {
    try {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      // Get user's recent achievements
      const { data: achievements } = await this.supabase
        .from('user_achievements')
        .select(`
          *,
          achievement_definitions!user_achievements_achievement_id_fkey(name, description, xp_points)
        `)
        .eq('user_id', userId)
        .gte('earned_at', oneWeekAgo)
        .order('earned_at', { ascending: false })
        .limit(5);

      // Get user's XP progress
      const { data: userXP } = await this.supabase
        .from('user_experience')
        .select('total_xp, current_level')
        .eq('user_id', userId)
        .single();

      // Get popular prompts this week
      const { data: popularPrompts } = await this.supabase
        .from('saved_prompts')
        .select('id, title, description, user_id, created_at')
        .gte('created_at', oneWeekAgo)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(3);

      // Get user's streaks
      const { data: streaks } = await this.supabase
        .from('user_streaks')
        .select('streak_type, current_count')
        .eq('user_id', userId);

      return {
        recent_achievements: achievements || [],
        user_level: userXP?.current_level || 1,
        user_total_xp: userXP?.total_xp || 0,
        popular_prompts: popularPrompts || [],
        current_streaks: streaks || [],
        week_start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString(),
        week_end: new Date().toLocaleDateString()
      };
    } catch (error) {
      console.error('Error generating weekly digest data:', error);
      return {};
    }
  }

  /**
   * Generate email content from template
   */
  private generateEmailContent(
    campaign: EmailCampaign,
    data: Record<string, any>
  ): EmailTemplate {
    let subject = campaign.subject_template;
    let html = campaign.html_template;
    let text = campaign.text_template || '';

    // Simple template replacement
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      const stringValue = String(value);
      
      subject = subject.replace(new RegExp(placeholder, 'g'), stringValue);
      html = html.replace(new RegExp(placeholder, 'g'), stringValue);
      text = text.replace(new RegExp(placeholder, 'g'), stringValue);
    });

    return { subject, html, text };
  }

  /**
   * Check if user can receive this type of email
   */
  private async canSendEmailToUser(
    userId: string,
    campaignType: string
  ): Promise<boolean> {
    try {
      const preferences = await this.getUserEmailPreferences(userId);
      
      if (!preferences || preferences.unsubscribed_at) {
        return false;
      }

      switch (campaignType) {
        case 'weekly':
          return preferences.weekly_digest;
        case 'triggered':
          return preferences.achievement_notifications;
        default:
          return preferences.marketing_emails;
      }
    } catch (error) {
      console.error('Error checking email permissions:', error);
      return false;
    }
  }

  /**
   * Check if we've sent this campaign recently
   */
  private async hasRecentSend(
    userId: string,
    campaignId: string,
    campaignType: string
  ): Promise<boolean> {
    try {
      let timeThreshold: Date;
      
      if (campaignType === 'weekly') {
        // Check if sent in the last 6 days
        timeThreshold = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000);
      } else {
        // For triggered emails, check last 24 hours
        timeThreshold = new Date(Date.now() - 24 * 60 * 60 * 1000);
      }

      const { data, error } = await this.supabase
        .from('email_sends')
        .select('id')
        .eq('user_id', userId)
        .eq('campaign_id', campaignId)
        .gte('sent_at', timeThreshold.toISOString())
        .limit(1);

      if (error) {
        console.error('Error checking recent sends:', error);
        return false;
      }

      return (data && data.length > 0);
    } catch (error) {
      console.error('Error checking recent sends:', error);
      return false;
    }
  }

  /**
   * Send email via email service (placeholder implementation)
   */
  private async sendEmail(
    to: string,
    subject: string,
    html: string,
    text?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    // TODO: Implement actual email sending
    // This could use services like:
    // - Resend
    // - SendGrid
    // - Mailgun
    // - Amazon SES
    // - Postmark
    
    try {
      // Placeholder implementation
      console.log('Sending email to:', to, 'Subject:', subject);
      
      // For now, simulate successful send
      return {
        success: true,
        messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } catch (error) {
      return {
        success: false,
        error: String(error)
      };
    }
  }

  /**
   * Log email send to database
   */
  private async logEmailSend(sendData: Partial<EmailSend>): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('email_sends')
        .insert([{
          ...sendData,
          sent_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Error logging email send:', error);
      }
    } catch (error) {
      console.error('Error logging email send:', error);
    }
  }

  /**
   * Create default email preferences for new user
   */
  private async createDefaultEmailPreferences(userId: string): Promise<UserEmailPreferences> {
    const defaultPrefs: Partial<UserEmailPreferences> = {
      user_id: userId,
      weekly_digest: true,
      achievement_notifications: true,
      marketplace_updates: true,
      affiliate_recommendations: true,
      marketing_emails: false
    };

    try {
      const { data, error } = await this.supabase
        .from('user_email_preferences')
        .insert([defaultPrefs])
        .select('*')
        .single();

      if (error) {
        console.error('Error creating default email preferences:', error);
      }

      return data as UserEmailPreferences;
    } catch (error) {
      console.error('Error creating default email preferences:', error);
      return defaultPrefs as UserEmailPreferences;
    }
  }
}

// Export singleton instance
export const emailAutomation = new EmailAutomation();

