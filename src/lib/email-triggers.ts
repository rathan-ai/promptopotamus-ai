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
      console.log(`Scheduled day-3 onboarding email for user ${userId}`);
      
    } catch (error) {
      console.error('Error triggering welcome email:', error);
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
      
      console.log(`Password reset email sent to user ${userId}`);
      
    } catch (error) {
      console.error('Error triggering password reset email:', error);
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
      
      console.log(`Certification completion email sent for ${certificationLevel} to user ${userId}`);
      
    } catch (error) {
      console.error('Error triggering certification completion email:', error);
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
      
      console.log(`Certification failed email sent for ${certificationLevel} to user ${userId}`);
      
    } catch (error) {
      console.error('Error triggering certification failed email:', error);
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
      
      console.log(`Purchase confirmation email sent for prompt ${promptId} to user ${userId}`);
      
    } catch (error) {
      console.error('Error triggering purchase confirmation email:', error);
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
      
      console.log(`First sale celebration email sent to seller ${sellerId}`);
      
    } catch (error) {
      console.error('Error triggering first sale email:', error);
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
      
      console.log(`Achievement email sent for "${achievementName}" to user ${userId}`);
      
    } catch (error) {
      console.error('Error triggering achievement email:', error);
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
      
      console.log(`New follower email sent to user ${userId}`);
      
    } catch (error) {
      console.error('Error triggering new follower email:', error);
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
      
      console.log(`Comment notification email sent to prompt owner ${promptOwnerId}`);
      
    } catch (error) {
      console.error('Error triggering comment notification email:', error);
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
      
      console.log(`Re-engagement email sent to inactive user ${userId}`);
      
    } catch (error) {
      console.error('Error triggering re-engagement email:', error);
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
      
      console.log(`Day 3 onboarding email sent to user ${userId}`);
      
    } catch (error) {
      console.error('Error triggering day 3 onboarding email:', error);
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