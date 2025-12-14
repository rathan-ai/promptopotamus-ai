/**
 * Standardized error handling for API routes
 */

import { NextResponse } from 'next/server';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export interface ErrorResponse {
  error: {
    message: string;
    code?: string;
    statusCode: number;
  };
}

/**
 * Standard error handler for API routes
 */
export function handleApiError(error: unknown): NextResponse<ErrorResponse> {
  // Handle known ApiError instances
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          message: error.message,
          code: error.code,
          statusCode: error.statusCode
        }
      },
      { status: error.statusCode }
    );
  }

  // Handle Supabase errors
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as { code: string; message: string };
    const statusCode = getSupabaseErrorStatus(supabaseError.code);
    
    return NextResponse.json(
      {
        error: {
          message: supabaseError.message || 'Database error',
          code: supabaseError.code,
          statusCode
        }
      },
      { status: statusCode }
    );
  }

  // Handle standard errors
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: {
          message: process.env.NODE_ENV === 'production' 
            ? 'An unexpected error occurred' 
            : error.message,
          statusCode: 500
        }
      },
      { status: 500 }
    );
  }

  // Handle unknown errors
  return NextResponse.json(
    {
      error: {
        message: 'An unexpected error occurred',
        statusCode: 500
      }
    },
    { status: 500 }
  );
}

/**
 * Map Supabase error codes to HTTP status codes
 */
function getSupabaseErrorStatus(code: string): number {
  const errorMap: Record<string, number> = {
    '22P02': 400, // Invalid text representation
    '23502': 400, // Not null violation
    '23503': 400, // Foreign key violation
    '23505': 409, // Unique violation
    '42501': 403, // Insufficient privilege
    '42P01': 404, // Undefined table
    'PGRST301': 404, // Row not found
    'PGRST116': 406, // Not acceptable
    'JWT': 401, // JWT related errors
  };

  return errorMap[code] || 500;
}

/**
 * Wrap async API route handlers with error handling
 */
export function withErrorHandler<T = any>(
  handler: (req: Request) => Promise<NextResponse<T>>
) {
  return async (req: Request): Promise<NextResponse<T | ErrorResponse>> => {
    try {
      return await handler(req);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Common API errors
 */
export const ApiErrors = {
  // Authentication errors
  unauthorized: () => new ApiError('Unauthorized', 401, 'UNAUTHORIZED'),
  forbidden: () => new ApiError('Forbidden', 403, 'FORBIDDEN'),
  
  // Validation errors
  badRequest: (message = 'Bad request') => new ApiError(message, 400, 'BAD_REQUEST'),
  validationFailed: (message: string) => new ApiError(message, 422, 'VALIDATION_FAILED'),
  
  // Resource errors
  notFound: (resource = 'Resource') => new ApiError(`${resource} not found`, 404, 'NOT_FOUND'),
  conflict: (message = 'Resource conflict') => new ApiError(message, 409, 'CONFLICT'),
  
  // Rate limiting
  tooManyRequests: () => new ApiError('Too many requests', 429, 'TOO_MANY_REQUESTS'),
  
  // Server errors
  internal: (message = 'Internal server error') => new ApiError(message, 500, 'INTERNAL_ERROR'),
  serviceUnavailable: () => new ApiError('Service unavailable', 503, 'SERVICE_UNAVAILABLE'),
};