/**
 * Query helpers and data access utilities
 */

import { createClient } from '@/lib/supabase/client';
import { createServerClient } from '@/lib/supabase/server';
import { Database } from '@/types/supabase';

type Tables = Database['public']['Tables'];
type TableName = keyof Tables;

/**
 * Generic query builder for common database operations
 */
export class QueryBuilder {
  private supabase;

  constructor(serverSide = false) {
    this.supabase = serverSide ? createServerClient() : createClient();
  }

  /**
   * Get all records from a table with optional filtering
   */
  async getAll<T extends TableName>(
    table: T,
    options: {
      select?: string;
      filters?: Record<string, any>;
      orderBy?: { column: string; ascending?: boolean };
      limit?: number;
    } = {}
  ) {
    let query = this.supabase.from(table).select(options.select || '*');

    // Apply filters
    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          query = query.eq(key, value);
        }
      });
    }

    // Apply ordering
    if (options.orderBy) {
      query = query.order(options.orderBy.column, { 
        ascending: options.orderBy.ascending ?? true 
      });
    }

    // Apply limit
    if (options.limit) {
      query = query.limit(options.limit);
    }

    return query;
  }

  /**
   * Get a single record by ID
   */
  async getById<T extends TableName>(
    table: T,
    id: string | number,
    select?: string
  ) {
    return this.supabase
      .from(table)
      .select(select || '*')
      .eq('id', id)
      .single();
  }

  /**
   * Create a new record
   */
  async create<T extends TableName>(
    table: T,
    data: Partial<Tables[T]['Insert']>
  ) {
    return this.supabase
      .from(table)
      .insert(data)
      .select()
      .single();
  }

  /**
   * Update a record by ID
   */
  async update<T extends TableName>(
    table: T,
    id: string | number,
    data: Partial<Tables[T]['Update']>
  ) {
    return this.supabase
      .from(table)
      .update(data)
      .eq('id', id)
      .select()
      .single();
  }

  /**
   * Delete a record by ID
   */
  async delete<T extends TableName>(
    table: T,
    id: string | number
  ) {
    return this.supabase
      .from(table)
      .delete()
      .eq('id', id);
  }

  /**
   * Count records in a table with optional filtering
   */
  async count<T extends TableName>(
    table: T,
    filters?: Record<string, any>
  ) {
    let query = this.supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          query = query.eq(key, value);
        }
      });
    }

    return query;
  }

  /**
   * Check if a record exists
   */
  async exists<T extends TableName>(
    table: T,
    filters: Record<string, any>
  ): Promise<boolean> {
    const { count } = await this.count(table, filters);
    return (count || 0) > 0;
  }

  /**
   * Batch insert multiple records
   */
  async batchInsert<T extends TableName>(
    table: T,
    data: Partial<Tables[T]['Insert']>[]
  ) {
    return this.supabase
      .from(table)
      .insert(data)
      .select();
  }

  /**
   * Upsert (insert or update) a record
   */
  async upsert<T extends TableName>(
    table: T,
    data: Partial<Tables[T]['Insert']>,
    conflictColumns?: string[]
  ) {
    let query = this.supabase
      .from(table)
      .upsert(data)
      .select();

    if (conflictColumns) {
      query = query;
    }

    return query;
  }
}

/**
 * Cached query helpers for frequently accessed data
 */
export class CachedQueries {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  private queryBuilder;

  constructor(serverSide = false) {
    this.queryBuilder = new QueryBuilder(serverSide);
  }

  /**
   * Get data with caching
   */
  async getCached<T>(
    key: string,
    queryFn: () => Promise<T>,
    ttlMs: number = 5 * 60 * 1000 // 5 minutes default
  ): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < cached.ttl) {
      return cached.data;
    }

    const data = await queryFn();
    this.cache.set(key, {
      data,
      timestamp: now,
      ttl: ttlMs
    });

    return data;
  }

  /**
   * Clear cache entry
   */
  clearCache(key: string) {
    this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clearAllCache() {
    this.cache.clear();
  }

  /**
   * Get cached user profile
   */
  async getUserProfile(userId: string) {
    return this.getCached(
      `user-profile-${userId}`,
      () => this.queryBuilder.getById('profiles', userId),
      2 * 60 * 1000 // 2 minutes
    );
  }

  /**
   * Get cached smart prompts
   */
  async getSmartPrompts(filters: any = {}) {
    const cacheKey = `smart-prompts-${JSON.stringify(filters)}`;
    return this.getCached(
      cacheKey,
      () => this.queryBuilder.getAll('saved_prompts', {
        filters: { 
          is_marketplace: true, 
          is_public: true,
          ...filters 
        },
        orderBy: { column: 'created_at', ascending: false }
      }),
      5 * 60 * 1000 // 5 minutes
    );
  }
}

/**
 * Database analytics and reporting helpers
 */
export class AnalyticsQueries {
  private supabase;

  constructor(serverSide = false) {
    this.supabase = serverSide ? createServerClient() : createClient();
  }

  /**
   * Get user analytics data
   */
  async getUserAnalytics(userId: string) {
    const [profile, transactions, prompts, purchases] = await Promise.all([
      this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single(),
      
      this.supabase
        .from('promptcoin_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10),
      
      this.supabase
        .from('saved_prompts')
        .select('id, title, created_at, downloads_count, rating_average')
        .eq('user_id', userId)
        .eq('is_marketplace', true),
      
      this.supabase
        .from('smart_prompt_purchases')
        .select('*, saved_prompts(title)')
        .eq('buyer_id', userId)
        .order('purchased_at', { ascending: false })
        .limit(10)
    ]);

    return {
      profile: profile.data,
      recentTransactions: transactions.data || [],
      publishedPrompts: prompts.data || [],
      recentPurchases: purchases.data || []
    };
  }

  /**
   * Get platform analytics (admin only)
   */
  async getPlatformAnalytics() {
    const [userStats, promptStats, transactionStats] = await Promise.all([
      this.supabase
        .from('profiles')
        .select('id, created_at, payment_status')
        .order('created_at', { ascending: false }),
      
      this.supabase
        .from('saved_prompts')
        .select('id, created_at, category, price, downloads_count')
        .eq('is_marketplace', true),
      
      this.supabase
        .from('promptcoin_transactions')
        .select('amount, type, created_at, payment_provider')
        .order('created_at', { ascending: false })
        .limit(100)
    ]);

    const totalUsers = userStats.data?.length || 0;
    const payingUsers = userStats.data?.filter(u => u.payment_status === 'active').length || 0;
    const totalPrompts = promptStats.data?.length || 0;
    const totalRevenue = transactionStats.data
      ?.filter(t => t.type === 'purchase')
      .reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

    return {
      users: {
        total: totalUsers,
        paying: payingUsers,
        conversionRate: totalUsers > 0 ? (payingUsers / totalUsers) * 100 : 0
      },
      prompts: {
        total: totalPrompts,
        avgDownloads: totalPrompts > 0 
          ? (promptStats.data?.reduce((sum, p) => sum + (p.downloads_count || 0), 0) || 0) / totalPrompts 
          : 0
      },
      revenue: {
        total: totalRevenue,
        recentTransactions: transactionStats.data || []
      }
    };
  }

  /**
   * Get trending prompts
   */
  async getTrendingPrompts(days: number = 7) {
    const sinceDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    
    return this.supabase
      .from('saved_prompts')
      .select(`
        id,
        title,
        category,
        downloads_count,
        rating_average,
        created_at,
        profiles(full_name)
      `)
      .eq('is_marketplace', true)
      .eq('is_public', true)
      .gte('created_at', sinceDate)
      .order('downloads_count', { ascending: false })
      .limit(10);
  }
}

/**
 * Real-time subscription helpers
 */
export class RealtimeQueries {
  private supabase;

  constructor(serverSide = false) {
    this.supabase = serverSide ? createServerClient() : createClient();
  }

  /**
   * Subscribe to user profile changes
   */
  subscribeToUserProfile(userId: string, callback: (payload: any) => void) {
    return this.supabase
      .channel(`profile-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }

  /**
   * Subscribe to new smart prompts
   */
  subscribeToSmartPrompts(callback: (payload: any) => void) {
    return this.supabase
      .channel('smart-prompts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'saved_prompts',
          filter: 'is_marketplace=eq.true'
        },
        callback
      )
      .subscribe();
  }

  /**
   * Subscribe to user transactions
   */
  subscribeToTransactions(userId: string, callback: (payload: any) => void) {
    return this.supabase
      .channel(`transactions-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'promptcoin_transactions',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }
}

// Export singleton instances
export const queryBuilder = new QueryBuilder();
export const serverQueryBuilder = new QueryBuilder(true);
export const cachedQueries = new CachedQueries();
export const serverCachedQueries = new CachedQueries(true);
export const analyticsQueries = new AnalyticsQueries();
export const serverAnalyticsQueries = new AnalyticsQueries(true);
export const realtimeQueries = new RealtimeQueries();
export const serverRealtimeQueries = new RealtimeQueries(true);