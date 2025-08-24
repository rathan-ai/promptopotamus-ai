import { createClient } from '@/lib/supabase/client';
import { createServerClient } from '@/lib/supabase/server';
import { SmartPrompt, Variable, UserCertificationStatus } from '@/shared/types';

/**
 * Smart prompt categories
 */
export const PROMPT_CATEGORIES = [
  'All Categories', 'Marketing & Sales', 'Content Writing', 'Code & Development', 
  'Data Analysis', 'Creative Writing', 'Business Strategy', 'Education & Training', 
  'Research', 'Customer Service', 'Social Media', 'Email Marketing', 'Other'
];

/**
 * Prompt service for managing smart prompts and marketplace
 */
export class PromptService {
  private supabase;

  constructor(serverSide = false) {
    this.supabase = serverSide ? createServerClient() : createClient();
  }

  /**
   * Get smart prompts with optional filtering
   */
  async getSmartPrompts(filters: {
    category?: string;
    complexity?: 'simple' | 'smart' | 'recipe';
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    priceRange?: 'free' | 'paid' | 'premium';
    tags?: string[];
    limit?: number;
  } = {}): Promise<SmartPrompt[]> {
    let query = this.supabase
      .from('saved_prompts')
      .select(`
        id,
        title,
        description,
        prompt_text,
        complexity_level,
        category,
        difficulty_level,
        tags,
        price,
        downloads_count,
        rating_average,
        rating_count,
        use_cases,
        ai_model_compatibility,
        variables,
        example_inputs,
        created_at,
        user_id,
        profiles(full_name)
      `)
      .eq('is_marketplace', true)
      .eq('is_public', true);

    // Apply filters
    if (filters.category && filters.category !== 'All Categories') {
      query = query.eq('category', filters.category);
    }
    
    if (filters.complexity) {
      query = query.eq('complexity_level', filters.complexity);
    }
    
    if (filters.difficulty) {
      query = query.eq('difficulty_level', filters.difficulty);
    }
    
    if (filters.priceRange) {
      switch (filters.priceRange) {
        case 'free':
          query = query.eq('price', 0);
          break;
        case 'paid':
          query = query.gt('price', 0).lte('price', 25);
          break;
        case 'premium':
          query = query.gt('price', 25);
          break;
      }
    }
    
    if (filters.tags && filters.tags.length > 0) {
      query = query.contains('tags', filters.tags);
    }

    // Order by rating and downloads
    query = query
      .order('rating_average', { ascending: false })
      .order('downloads_count', { ascending: false })
      .limit(filters.limit || 50);

    const { data: prompts, error } = await query;

    if (error) {
      console.error('Error fetching smart prompts:', error);
      return [];
    }

    // Normalize the data to ensure all fields are in the expected format
    return (prompts || []).map((prompt: any) => ({
      ...prompt,
      variables: Array.isArray(prompt.variables) ? prompt.variables : [],
      tags: Array.isArray(prompt.tags) ? prompt.tags : [],
      use_cases: Array.isArray(prompt.use_cases) ? prompt.use_cases : [],
      ai_model_compatibility: Array.isArray(prompt.ai_model_compatibility) ? prompt.ai_model_compatibility : [],
      example_inputs: typeof prompt.example_inputs === 'object' ? prompt.example_inputs : {},
      rating_average: prompt.rating_average || 0,
      rating_count: prompt.rating_count || 0,
      downloads_count: prompt.downloads_count || 0,
      price: prompt.price || 0
    }));
  }

  /**
   * Get a single smart prompt by ID
   */
  async getSmartPromptById(id: number): Promise<SmartPrompt | null> {
    const { data: prompt, error } = await this.supabase
      .from('saved_prompts')
      .select(`
        id,
        title,
        description,
        prompt_text,
        complexity_level,
        category,
        difficulty_level,
        tags,
        price,
        downloads_count,
        rating_average,
        rating_count,
        use_cases,
        ai_model_compatibility,
        variables,
        example_inputs,
        created_at,
        user_id,
        profiles(full_name)
      `)
      .eq('id', id)
      .eq('is_marketplace', true)
      .eq('is_public', true)
      .single();

    if (error || !prompt) {
      return null;
    }

    return {
      ...prompt,
      variables: Array.isArray(prompt.variables) ? prompt.variables : [],
      tags: Array.isArray(prompt.tags) ? prompt.tags : [],
      use_cases: Array.isArray(prompt.use_cases) ? prompt.use_cases : [],
      ai_model_compatibility: Array.isArray(prompt.ai_model_compatibility) ? prompt.ai_model_compatibility : [],
      example_inputs: typeof prompt.example_inputs === 'object' ? prompt.example_inputs : {},
      rating_average: prompt.rating_average || 0,
      rating_count: prompt.rating_count || 0,
      downloads_count: prompt.downloads_count || 0,
      price: prompt.price || 0
    };
  }

  /**
   * Get user's own prompts (created and purchased)
   */
  async getUserPrompts(userId: string, type: 'created' | 'purchased' | 'all' = 'all') {
    let createdPrompts = [];
    let purchasedPrompts = [];

    // Get created prompts
    if (type === 'created' || type === 'all') {
      const { data: created } = await this.supabase
        .from('saved_prompts')
        .select(`
          id,
          title,
          description,
          prompt_text,
          complexity_level,
          category,
          difficulty_level,
          tags,
          price,
          downloads_count,
          rating_average,
          rating_count,
          use_cases,
          ai_model_compatibility,
          is_marketplace,
          is_public,
          created_at,
          updated_at,
          variables,
          recipe_steps,
          instructions,
          example_inputs,
          example_outputs
        `)
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

      createdPrompts = created || [];
    }

    // Get purchased prompts
    if (type === 'purchased' || type === 'all') {
      const { data: purchased } = await this.supabase
        .from('smart_prompt_purchases')
        .select(`
          id,
          purchase_price,
          purchased_at,
          saved_prompts!smart_prompt_purchases_prompt_id_fkey (
            id,
            title,
            description,
            prompt_text,
            complexity_level,
            category,
            difficulty_level,
            tags,
            use_cases,
            ai_model_compatibility,
            variables,
            recipe_steps,
            instructions,
            example_inputs,
            example_outputs,
            user_id,
            profiles(full_name)
          )
        `)
        .eq('buyer_id', userId)
        .order('purchased_at', { ascending: false });

      purchasedPrompts = purchased?.map(purchase => ({
        ...purchase.saved_prompts,
        purchase_info: {
          purchase_price: purchase.purchase_price,
          purchased_at: purchase.purchased_at
        }
      })) || [];
    }

    return {
      created: createdPrompts,
      purchased: purchasedPrompts
    };
  }

  /**
   * Create a new smart prompt
   */
  async createSmartPrompt(userId: string, promptData: {
    title: string;
    description: string;
    prompt_text: string;
    complexity_level: 'simple' | 'smart' | 'recipe';
    category: string;
    difficulty_level: 'beginner' | 'intermediate' | 'advanced';
    tags: string[];
    price: number;
    use_cases: string[];
    ai_model_compatibility: string[];
    variables: Variable[];
    is_marketplace: boolean;
    instructions?: string;
    example_inputs?: Record<string, string>;
  }) {
    const { error } = await this.supabase
      .from('saved_prompts')
      .insert({
        ...promptData,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    return { error };
  }

  /**
   * Update an existing smart prompt
   */
  async updateSmartPrompt(userId: string, promptId: number, updates: any) {
    const { error } = await this.supabase
      .from('saved_prompts')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', promptId)
      .eq('user_id', userId);

    return { error };
  }

  /**
   * Delete a smart prompt
   */
  async deleteSmartPrompt(userId: string, promptId: number) {
    // Check if prompt has been sold - prevent deletion if it has purchases
    const { data: purchases } = await this.supabase
      .from('smart_prompt_purchases')
      .select('id')
      .eq('prompt_id', promptId)
      .eq('seller_id', userId);

    if (purchases && purchases.length > 0) {
      return { 
        error: { 
          message: 'Cannot delete prompt that has been purchased by others. You can unpublish it instead.' 
        } 
      };
    }

    const { error } = await this.supabase
      .from('saved_prompts')
      .delete()
      .eq('id', promptId)
      .eq('user_id', userId);

    return { error };
  }

  /**
   * Purchase a smart prompt
   */
  async purchaseSmartPrompt(userId: string, promptId: number) {
    // Get prompt details
    const prompt = await this.getSmartPromptById(promptId);
    if (!prompt) {
      return { error: { message: 'Prompt not found' } };
    }

    // Check if user is trying to buy their own prompt
    if (prompt.user_id === userId) {
      return { error: { message: 'You cannot purchase your own prompt' } };
    }

    // Check if user has already purchased this prompt
    const { data: existingPurchase } = await this.supabase
      .from('smart_prompt_purchases')
      .select('id')
      .eq('prompt_id', promptId)
      .eq('buyer_id', userId)
      .single();

    if (existingPurchase) {
      return { error: { message: 'You have already purchased this prompt' } };
    }

    // If prompt is free, create purchase record directly
    if (!prompt.price || prompt.price === 0) {
      const { error: purchaseError } = await this.supabase
        .from('smart_prompt_purchases')
        .insert({
          prompt_id: promptId,
          buyer_id: userId,
          seller_id: prompt.user_id,
          purchase_price: 0,
          purchased_at: new Date().toISOString()
        });

      if (purchaseError) {
        return { error: purchaseError };
      }

      // Update download count
      await this.supabase
        .from('saved_prompts')
        .update({ downloads_count: this.supabase.sql`downloads_count + 1` })
        .eq('id', promptId);

      return { 
        success: true, 
        message: 'Free prompt added to your collection!',
        free: true 
      };
    }

    // For paid prompts, return prompt details for payment processing
    return {
      success: true,
      requiresPayment: true,
      prompt: {
        id: prompt.id,
        title: prompt.title,
        price: prompt.price,
        seller_id: prompt.user_id
      }
    };
  }

  /**
   * Get user certification status for marketplace features
   */
  async getUserCertificationStatus(userId: string): Promise<UserCertificationStatus> {
    const { data: userCertificates } = await this.supabase
      .from('user_certificates')
      .select('certificate_slug, expires_at, earned_at, credential_id')
      .eq('user_id', userId);

    const hasValidCertificate = (userCertificates || []).some(cert => 
      new Date(cert.expires_at) > new Date()
    );

    return {
      hasValidCertificate,
      certificates: userCertificates || []
    };
  }

  /**
   * Get available categories
   */
  getCategories(): string[] {
    return PROMPT_CATEGORIES;
  }
}

// Export singleton instances
export const promptService = new PromptService();
export const serverPromptService = new PromptService(true);