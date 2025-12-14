/**
 * Common middleware utilities for API routes
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { ApiErrors, withErrorHandler } from './error-handler';

/**
 * Verify user authentication
 */
export async function requireAuth() {
  const supabase = await createServerClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    throw ApiErrors.unauthorized();
  }
  
  return { user, supabase };
}

/**
 * Verify admin role
 */
export async function requireAdmin() {
  const { user, supabase } = await requireAuth();
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  
  if (profile?.role !== 'admin') {
    throw ApiErrors.forbidden();
  }
  
  return { user, supabase, isAdmin: true };
}

/**
 * Rate limiting middleware
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(
  maxRequests: number = 10,
  windowMs: number = 60000 // 1 minute default
) {
  return async (identifier: string) => {
    const now = Date.now();
    const limit = rateLimitStore.get(identifier);
    
    if (!limit || now > limit.resetTime) {
      rateLimitStore.set(identifier, {
        count: 1,
        resetTime: now + windowMs
      });
      return;
    }
    
    if (limit.count >= maxRequests) {
      throw ApiErrors.tooManyRequests();
    }
    
    limit.count++;
  };
}

/**
 * Validate request body with schema
 */
export async function validateBody<T>(
  req: Request,
  validator: (data: any) => T | null
): Promise<T> {
  try {
    const body = await req.json();
    const validated = validator(body);
    
    if (!validated) {
      throw ApiErrors.validationFailed('Invalid request body');
    }
    
    return validated;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw ApiErrors.badRequest('Invalid JSON');
    }
    throw error;
  }
}

/**
 * CORS headers for API routes
 */
export function corsHeaders(origin?: string) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Handle OPTIONS requests for CORS
 */
export function handleOptions() {
  return new NextResponse(null, { 
    status: 200, 
    headers: corsHeaders() 
  });
}

/**
 * Combined middleware wrapper
 */
export function withMiddleware(
  handler: (req: Request) => Promise<NextResponse>,
  options?: {
    requireAuth?: boolean;
    requireAdmin?: boolean;
    rateLimit?: { max: number; window?: number };
    cors?: boolean | string;
  }
) {
  return withErrorHandler(async (req: Request) => {
    // Handle CORS preflight
    if (options?.cors && req.method === 'OPTIONS') {
      return handleOptions();
    }
    
    // Apply rate limiting
    if (options?.rateLimit) {
      const identifier = req.headers.get('x-forwarded-for') || 'anonymous';
      await rateLimit(options.rateLimit.max, options.rateLimit.window)(identifier);
    }
    
    // Check authentication
    if (options?.requireAdmin) {
      await requireAdmin();
    } else if (options?.requireAuth) {
      await requireAuth();
    }
    
    // Execute handler
    const response = await handler(req);
    
    // Add CORS headers if needed
    if (options?.cors) {
      const origin = typeof options.cors === 'string' ? options.cors : undefined;
      Object.entries(corsHeaders(origin)).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
    }
    
    return response;
  });
}