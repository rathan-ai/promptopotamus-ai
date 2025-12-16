import { serverEmailAutomation } from '@/lib/email-automation-server';
import { serverAchievementEngine } from '@/lib/achievements-server';

/**
 * Email Triggers System - Connects user actions to email campaigns
 * This system automatically sends emails based on user behavior and events
 */
export class EmailTriggerSystem {
  
  /**
   * Trigger welcome email for new user registration
   */
  static async triggerWelcomeEmail(userId: string, userName: string) {
    try {
      await serverEmailAutomation.sendCampaignEmail(
        userId,
        'welcome_new_user',
        {
          user_name: userName,
          dashboard_link: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
          learning_hub_link: `${process.env.NEXT_PUBLIC_SITE_URL}/`,
          certification_link: `${process.env.NEXT_PUBLIC_SITE_URL}/certificates`
        }
      );
      
      // Schedule follow-up onboarding email for day 3
      // This would be handled by a scheduled job system in production
      // TODO: Consider structured logging for scheduled email events
      
    } catch (error) {
      // TODO: Consider structured logging for welcome email trigger errors
    }
  }

  /**
   * Trigger password reset email
   */
  static async triggerPasswordResetEmail(userId: string, userName: string, resetToken: string) {
    try {
      const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password?token=${resetToken}`;
      
      await serverEmailAutomation.sendCampaignEmail(
        userId,
        'password_reset',
        {
          user_name: userName,
          reset_link: resetLink
        }
      );
      
      // TODO: Consider structured logging for password reset email events
      
    } catch (error) {
      // TODO: Consider structured logging for password reset email trigger errors
    }
  }

  /**
   * Trigger certification completion email
   */
  static async triggerCertificationCompletedEmail(
    userId: string, 
    userName: string,
    certificationLevel: string,
    credentialId: string
  ) {
    try {
      await serverEmailAutomation.sendCampaignEmail(
        userId,
        'certification_completed',
        {
          user_name: userName,
          certification_level: certificationLevel,
          certificate_link: `${process.env.NEXT_PUBLIC_SITE_URL}/certificates/view/${credentialId}`,
          create_prompt_link: `${process.env.NEXT_PUBLIC_SITE_URL}/smart-prompts/builder`,
          dashboard_link: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`
        }
      );
      
      // TODO: Consider structured logging for certification completion email events
      
    } catch (error) {
      // TODO: Consider structured logging for certification completion email trigger errors
    }
  }

  /**
   * Trigger certification failed email
   */
  static async triggerCertificationFailedEmail(
    userId: string,
    userName: string,
    certificationLevel: string,
    attemptsRemaining: number
  ) {
    try {
      await serverEmailAutomation.sendCampaignEmail(
        userId,
        'certification_failed',
        {
          user_name: userName,
          certification_level: certificationLevel,
          attempts_remaining: attemptsRemaining.toString(),
          study_guide_link: `${process.env.NEXT_PUBLIC_SITE_URL}/resources`,
          practice_prompts_link: `${process.env.NEXT_PUBLIC_SITE_URL}/templates`,
          community_link: `${process.env.NEXT_PUBLIC_SITE_URL}/smart-prompts`,
          retry_link: `${process.env.NEXT_PUBLIC_SITE_URL}/quiz/${certificationLevel.toLowerCase()}`
        }
      );
      
      // TODO: Consider structured logging for certification failed email events
      
    } catch (error) {
      // TODO: Consider structured logging for certification failed email trigger errors
    }
  }

  /**
   * Trigger purchase confirmation email
   */
  static async triggerPurchaseConfirmationEmail(
    userId: string,
    userName: string,
    promptTitle: string,
    creatorName: string,
    purchasePrice: string,
    promptId: string
  ) {
    try {
      await serverEmailAutomation.sendCampaignEmail(
        userId,
        'purchase_confirmation',
        {
          user_name: userName,
          prompt_title: promptTitle,
          creator_name: creatorName,
          purchase_price: purchasePrice,
          purchase_date: new Date().toLocaleDateString(),
          download_link: `${process.env.NEXT_PUBLIC_SITE_URL}/smart-prompts/${promptId}`,
          review_link: `${process.env.NEXT_PUBLIC_SITE_URL}/smart-prompts/${promptId}#reviews`
        }
      );
      
      // TODO: Consider structured logging for purchase confirmation email events
      
    } catch (error) {
      // TODO: Consider structured logging for purchase confirmation email trigger errors
    }
  }

  /**
   * Trigger first sale celebration email
   */
  static async triggerFirstSaleEmail(
    sellerId: string,
    sellerName: string,
    promptTitle: string,
    salePrice: string,
    creatorEarnings: string,
    buyerName: string
  ) {
    try {
      await serverEmailAutomation.sendCampaignEmail(
        sellerId,
        'first_sale_celebration',
        {
          user_name: sellerName,
          prompt_title: promptTitle,
          sale_price: salePrice,
          creator_earnings: creatorEarnings,
          buyer_name: buyerName,
          creator_dashboard_link: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`
        }
      );
      
      // TODO: Consider structured logging for first sale celebration email events
      
    } catch (error) {
      // TODO: Consider structured logging for first sale email trigger errors
    }
  }

  /**
   * Trigger achievement earned email (enhanced)
   */
  static async triggerAchievementEarnedEmail(
    userId: string,
    userName: string,
    achievementName: string,
    achievementDescription: string,
    xpEarned: number,
    newLevel: number
  ) {
    try {
      await serverEmailAutomation.sendCampaignEmail(
        userId,
        'achievement_earned',
        {
          user_name: userName,
          achievement_name: achievementName,
          achievement_description: achievementDescription,
          xp_earned: xpEarned.toString(),
          new_level: newLevel.toString(),
          dashboard_link: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`
        }
      );
      
      // TODO: Consider structured logging for achievement email events
      
    } catch (error) {
      // TODO: Consider structured logging for achievement email trigger errors
    }
  }

  /**
   * Trigger new follower notification email
   */
  static async triggerNewFollowerEmail(
    userId: string,
    userName: string,
    followerName: string,
    totalFollowers: number,
    reputationScore: number,
    promptsCreated: number
  ) {
    try {
      await serverEmailAutomation.sendCampaignEmail(
        userId,
        'new_follower',
        {
          user_name: userName,
          follower_name: followerName,
          total_followers: totalFollowers.toString(),
          reputation_score: reputationScore.toString(),
          prompts_created: promptsCreated.toString(),
          profile_link: `${process.env.NEXT_PUBLIC_SITE_URL}/profile/${userId}`
        }
      );
      
      // TODO: Consider structured logging for new follower email events
      
    } catch (error) {
      // TODO: Consider structured logging for new follower email trigger errors
    }
  }

  /**
   * Trigger comment received notification email
   */
  static async triggerCommentReceivedEmail(
    promptOwnerId: string,
    promptOwnerName: string,
    commenterName: string,
    promptTitle: string,
    commentPreview: string,
    promptId: string,
    commentId: string
  ) {
    try {
      await serverEmailAutomation.sendCampaignEmail(
        promptOwnerId,
        'prompt_comment_received',
        {
          user_name: promptOwnerName,
          commenter_name: commenterName,
          prompt_title: promptTitle,
          comment_preview: commentPreview.substring(0, 150) + (commentPreview.length > 150 ? '...' : ''),
          comment_link: `${process.env.NEXT_PUBLIC_SITE_URL}/smart-prompts/${promptId}#comment-${commentId}`
        }
      );
      
      // TODO: Consider structured logging for comment notification email events
      
    } catch (error) {
      // TODO: Consider structured logging for comment notification email trigger errors
    }
  }

  /**
   * Trigger re-engagement email for inactive users
   */
  static async triggerReEngagementEmail(
    userId: string,
    userName: string,
    newPromptsCount: number,
    newAchievementsCount: number,
    newUsersCount: number
  ) {
    try {
      await serverEmailAutomation.sendCampaignEmail(
        userId,
        'inactive_user_return',
        {
          user_name: userName,
          new_prompts_count: newPromptsCount.toString(),
          new_achievements_count: newAchievementsCount.toString(),
          new_users_count: newUsersCount.toString(),
          return_link: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?welcome_back=true`
        }
      );
      
      // TODO: Consider structured logging for re-engagement email events
      
    } catch (error) {
      // TODO: Consider structured logging for re-engagement email trigger errors
    }
  }

  /**
   * Trigger onboarding day 3 email (for users who haven't gotten certified)
   */
  static async triggerOnboardingDay3Email(userId: string, userName: string) {
    try {
      await serverEmailAutomation.sendCampaignEmail(
        userId,
        'onboarding_day_3',
        {
          user_name: userName,
          certification_link: `${process.env.NEXT_PUBLIC_SITE_URL}/certificates`,
          dashboard_link: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`
        }
      );

      // TODO: Consider structured logging for onboarding email events

    } catch (error) {
      // TODO: Consider structured logging for onboarding email trigger errors
    }
  }

  /**
   * Trigger onboarding day 7 email (for users who haven't created a prompt yet)
   */
  static async triggerOnboardingDay7Email(userId: string, userName: string, hasPrompts: boolean) {
    try {
      // Skip if user has already created prompts
      if (hasPrompts) {
        return;
      }

      await serverEmailAutomation.sendCampaignEmail(
        userId,
        'onboarding_day_7',
        {
          user_name: userName,
          create_prompt_link: `${process.env.NEXT_PUBLIC_SITE_URL}/smart-prompts/builder`,
          marketplace_link: `${process.env.NEXT_PUBLIC_SITE_URL}/smart-prompts`,
          dashboard_link: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
          success_stories_link: `${process.env.NEXT_PUBLIC_SITE_URL}/resources`
        }
      );

    } catch (error) {
      // TODO: Consider structured logging for onboarding day 7 email trigger errors
    }
  }
}

/**
 * Helper functions for easier integration with existing code
 */

// Authentication triggers
export const triggerWelcomeEmail = EmailTriggerSystem.triggerWelcomeEmail;
export const triggerPasswordResetEmail = EmailTriggerSystem.triggerPasswordResetEmail;

// Certification triggers
export const triggerCertificationCompletedEmail = EmailTriggerSystem.triggerCertificationCompletedEmail;
export const triggerCertificationFailedEmail = EmailTriggerSystem.triggerCertificationFailedEmail;

// Marketplace triggers
export const triggerPurchaseConfirmationEmail = EmailTriggerSystem.triggerPurchaseConfirmationEmail;
export const triggerFirstSaleEmail = EmailTriggerSystem.triggerFirstSaleEmail;

// Social triggers
export const triggerNewFollowerEmail = EmailTriggerSystem.triggerNewFollowerEmail;
export const triggerCommentReceivedEmail = EmailTriggerSystem.triggerCommentReceivedEmail;

// Achievement triggers
export const triggerAchievementEarnedEmail = EmailTriggerSystem.triggerAchievementEarnedEmail;

// Re-engagement triggers
export const triggerReEngagementEmail = EmailTriggerSystem.triggerReEngagementEmail;
export const triggerOnboardingDay3Email = EmailTriggerSystem.triggerOnboardingDay3Email;
export const triggerOnboardingDay7Email = EmailTriggerSystem.triggerOnboardingDay7Email;