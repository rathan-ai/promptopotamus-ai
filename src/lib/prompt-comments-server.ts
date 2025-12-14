import { createServerClient } from '@/lib/supabase/server';

export interface PromptComment {
  id: string;
  prompt_id: string;
  user_id: string;
  comment_text: string;
  parent_comment_id?: string;
  is_edited: boolean;
  edited_at?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  profiles?: {
    name: string;
    email: string;
    role: string;
  };
  user_profiles_extended?: {
    bio: string;
    expertise_tags: string[];
    reputation_score: number;
  };
  replies?: PromptComment[];
}

export interface CommentInput {
  prompt_id: string;
  comment_text: string;
  parent_comment_id?: string;
}

/**
 * Server-side Prompt Comment System
 */
export class ServerPromptCommentManager {
  private async getSupabase() {
    return await createServerClient();
  }

  /**
   * Add a comment to a prompt
   */
  async addComment(
    userId: string,
    commentInput: CommentInput
  ): Promise<PromptComment | null> {
    try {
      const supabase = await this.getSupabase();
      
      // Verify user has purchased the prompt
      const hasPurchased = await this.userHasPurchasedPrompt(userId, commentInput.prompt_id);
      if (!hasPurchased) {

        return null;
      }

      // Insert comment
      const { data, error } = await supabase
        .from('prompt_comments')
        .insert([{
          user_id: userId,
          prompt_id: commentInput.prompt_id,
          comment_text: commentInput.comment_text.trim(),
          parent_comment_id: commentInput.parent_comment_id || null
        }])
        .select(`
          *,
          profiles!prompt_comments_user_id_fkey(name, email, role),
          user_profiles_extended!prompt_comments_user_id_fkey(bio, expertise_tags, reputation_score)
        `)
        .single();

      if (error) {

        return null;
      }

      return data;
    } catch (error) {

      return null;
    }
  }

  /**
   * Get comments for a prompt (only for users who have purchased it)
   */
  async getPromptComments(
    promptId: string,
    userId?: string,
    limit = 50,
    offset = 0
  ): Promise<PromptComment[]> {
    try {
      const supabase = await this.getSupabase();
      
      // If userId provided, verify they have purchased the prompt
      if (userId) {
        const hasPurchased = await this.userHasPurchasedPrompt(userId, promptId);
        if (!hasPurchased) {

          return [];
        }
      }

      // Get top-level comments first
      const { data: comments, error } = await supabase
        .from('prompt_comments')
        .select(`
          *,
          profiles!prompt_comments_user_id_fkey(name, email, role),
          user_profiles_extended!prompt_comments_user_id_fkey(bio, expertise_tags, reputation_score)
        `)
        .eq('prompt_id', promptId)
        .is('parent_comment_id', null)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {

        return [];
      }

      if (!comments || comments.length === 0) {
        return [];
      }

      // Get replies for each comment
      const commentsWithReplies = await Promise.all(
        comments.map(async (comment) => {
          const replies = await this.getCommentReplies(comment.id);
          return {
            ...comment,
            replies
          };
        })
      );

      return commentsWithReplies;
    } catch (error) {

      return [];
    }
  }

  /**
   * Get replies to a comment
   */
  async getCommentReplies(commentId: string): Promise<PromptComment[]> {
    try {
      const supabase = await this.getSupabase();
      
      const { data: replies, error } = await supabase
        .from('prompt_comments')
        .select(`
          *,
          profiles!prompt_comments_user_id_fkey(name, email, role),
          user_profiles_extended!prompt_comments_user_id_fkey(bio, expertise_tags, reputation_score)
        `)
        .eq('parent_comment_id', commentId)
        .order('created_at', { ascending: true });

      if (error) {

        return [];
      }

      return replies || [];
    } catch (error) {

      return [];
    }
  }

  /**
   * Update a comment (only by the author)
   */
  async updateComment(
    commentId: string,
    userId: string,
    newText: string
  ): Promise<PromptComment | null> {
    try {
      const supabase = await this.getSupabase();
      
      const { data, error } = await supabase
        .from('prompt_comments')
        .update({
          comment_text: newText.trim(),
          is_edited: true,
          edited_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId)
        .eq('user_id', userId) // Ensure only author can edit
        .select(`
          *,
          profiles!prompt_comments_user_id_fkey(name, email, role),
          user_profiles_extended!prompt_comments_user_id_fkey(bio, expertise_tags, reputation_score)
        `)
        .single();

      if (error) {

        return null;
      }

      return data;
    } catch (error) {

      return null;
    }
  }

  /**
   * Delete a comment (only by the author)
   */
  async deleteComment(commentId: string, userId: string): Promise<boolean> {
    try {
      const supabase = await this.getSupabase();
      
      const { error } = await supabase
        .from('prompt_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId); // Ensure only author can delete

      if (error) {

        return false;
      }

      return true;
    } catch (error) {

      return false;
    }
  }

  /**
   * Get comment count for a prompt
   */
  async getCommentCount(promptId: string): Promise<number> {
    try {
      const supabase = await this.getSupabase();
      
      const { count, error } = await supabase
        .from('prompt_comments')
        .select('id', { count: 'exact' })
        .eq('prompt_id', promptId);

      if (error) {

        return 0;
      }

      return count || 0;
    } catch (error) {

      return 0;
    }
  }

  /**
   * Get user's comments across all prompts
   */
  async getUserComments(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<PromptComment[]> {
    try {
      const supabase = await this.getSupabase();
      
      const { data: comments, error } = await supabase
        .from('prompt_comments')
        .select(`
          *,
          saved_prompts!prompt_comments_prompt_id_fkey(title, description)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {

        return [];
      }

      return comments || [];
    } catch (error) {

      return [];
    }
  }

  /**
   * Search comments within a prompt
   */
  async searchComments(
    promptId: string,
    searchQuery: string,
    userId?: string,
    limit = 20
  ): Promise<PromptComment[]> {
    try {
      const supabase = await this.getSupabase();
      
      // Verify user has purchased the prompt if userId provided
      if (userId) {
        const hasPurchased = await this.userHasPurchasedPrompt(userId, promptId);
        if (!hasPurchased) {
          return [];
        }
      }

      const { data: comments, error } = await supabase
        .from('prompt_comments')
        .select(`
          *,
          profiles!prompt_comments_user_id_fkey(name, email, role),
          user_profiles_extended!prompt_comments_user_id_fkey(bio, expertise_tags, reputation_score)
        `)
        .eq('prompt_id', promptId)
        .textSearch('comment_text', searchQuery)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {

        return [];
      }

      return comments || [];
    } catch (error) {

      return [];
    }
  }

  /**
   * Get recent activity (comments) for admin dashboard
   */
  async getRecentCommentActivity(limit = 10): Promise<PromptComment[]> {
    try {
      const supabase = await this.getSupabase();
      
      const { data: comments, error } = await supabase
        .from('prompt_comments')
        .select(`
          *,
          profiles!prompt_comments_user_id_fkey(name, email, role),
          saved_prompts!prompt_comments_prompt_id_fkey(title, description, user_id)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {

        return [];
      }

      return comments || [];
    } catch (error) {

      return [];
    }
  }

  /**
   * Verify user has purchased the prompt
   */
  private async userHasPurchasedPrompt(userId: string, promptId: string): Promise<boolean> {
    try {
      const supabase = await this.getSupabase();
      
      // Check if user is the prompt creator (they can always comment)
      const { data: prompt } = await supabase
        .from('saved_prompts')
        .select('user_id')
        .eq('id', promptId)
        .single();

      if (prompt?.user_id === userId) {
        return true;
      }

      // Check if user has purchased the prompt
      const { data: purchase } = await supabase
        .from('smart_prompt_purchases')
        .select('id')
        .eq('buyer_id', userId)
        .eq('prompt_id', promptId)
        .single();

      return !!purchase;
    } catch (error) {

      return false;
    }
  }

  /**
   * Check if user can comment on prompt
   */
  async canUserComment(userId: string, promptId: string): Promise<boolean> {
    return this.userHasPurchasedPrompt(userId, promptId);
  }

  /**
   * Get comment statistics for admin
   */
  async getCommentStats(): Promise<{
    total_comments: number;
    comments_today: number;
    comments_this_week: number;
    top_commented_prompts: Array<{ prompt_id: string; title: string; comment_count: number }>;
    active_commenters: Array<{ user_id: string; name: string; comment_count: number }>;
  }> {
    try {
      const supabase = await this.getSupabase();
      const today = new Date().toISOString().split('T')[0];
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Total comments
      const { count: totalComments } = await supabase
        .from('prompt_comments')
        .select('id', { count: 'exact' });

      // Comments today
      const { count: commentsToday } = await supabase
        .from('prompt_comments')
        .select('id', { count: 'exact' })
        .gte('created_at', today);

      // Comments this week
      const { count: commentsThisWeek } = await supabase
        .from('prompt_comments')
        .select('id', { count: 'exact' })
        .gte('created_at', weekAgo);

      // Top commented prompts (requires aggregation - simplified version)
      const { data: topPrompts } = await supabase
        .from('prompt_comments')
        .select(`
          prompt_id,
          saved_prompts!prompt_comments_prompt_id_fkey(title)
        `)
        .limit(100); // Get sample and aggregate client-side for simplicity

      const promptCounts = topPrompts?.reduce((acc, comment) => {
        acc[comment.prompt_id] = (acc[comment.prompt_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const topCommentedPrompts = Object.entries(promptCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([promptId, count]) => {
          const prompt = topPrompts?.find(p => p.prompt_id === promptId);
          return {
            prompt_id: promptId,
            title: (prompt?.saved_prompts as any)?.title || 'Unknown',
            comment_count: count
          };
        });

      // Active commenters (simplified)
      const { data: activeUsers } = await supabase
        .from('prompt_comments')
        .select(`
          user_id,
          profiles!prompt_comments_user_id_fkey(name)
        `)
        .gte('created_at', weekAgo)
        .limit(100);

      const userCounts = activeUsers?.reduce((acc, comment) => {
        acc[comment.user_id] = (acc[comment.user_id] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const activeCommenters = Object.entries(userCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([userId, count]) => {
          const user = activeUsers?.find(u => u.user_id === userId);
          return {
            user_id: userId,
            name: (user?.profiles as any)?.name || 'Unknown',
            comment_count: count
          };
        });

      return {
        total_comments: totalComments || 0,
        comments_today: commentsToday || 0,
        comments_this_week: commentsThisWeek || 0,
        top_commented_prompts: topCommentedPrompts,
        active_commenters: activeCommenters
      };
    } catch (error) {

      return {
        total_comments: 0,
        comments_today: 0,
        comments_this_week: 0,
        top_commented_prompts: [],
        active_commenters: []
      };
    }
  }
}

// Export singleton instance
export const serverPromptComments = new ServerPromptCommentManager();