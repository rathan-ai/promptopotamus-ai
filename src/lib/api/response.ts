/**
 * Standardized API response utilities for consistent error handling and responses
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';

/**
 * Standard API response interfaces
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  statusCode: number;
}

/**
 * Standard HTTP status codes
 */
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const;

/**
 * Standard error codes
 */
export const ErrorCodes = {
  // Authentication errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Resource errors
  NOT_FOUND: 'NOT_FOUND',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  
  // Permission errors
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Business logic errors
  INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  INVALID_OPERATION: 'INVALID_OPERATION',
  
  // Payment errors
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
  INVALID_PAYMENT_METHOD: 'INVALID_PAYMENT_METHOD',
  
  // System errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
} as const;

/**
 * Success response helper
 */
export function successResponse<T>(
  data?: T,
  message?: string,
  meta?: ApiResponse<T>['meta'],
  status: number = HttpStatus.OK
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      meta
    },
    { status }
  );
}

/**
 * Error response helper
 */
export function errorResponse(
  error: string | ApiError,
  status?: number
): NextResponse<ApiResponse> {
  if (typeof error === 'string') {
    return NextResponse.json(
      {
        success: false,
        error
      },
      { status: status || HttpStatus.INTERNAL_SERVER_ERROR }
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: error.message,
      code: error.code,
      details: error.details
    },
    { status: error.statusCode }
  );
}

/**
 * Validation error response helper
 */
export function validationErrorResponse(
  errors: z.ZodError | Record<string, string> | string
): NextResponse<ApiResponse> {
  if (typeof errors === 'string') {
    return errorResponse({
      code: ErrorCodes.VALIDATION_ERROR,
      message: errors,
      statusCode: HttpStatus.BAD_REQUEST
    });
  }

  if (errors instanceof z.ZodError) {
    const formattedErrors = errors.errors.reduce((acc, err) => {
      const path = err.path.join('.');
      acc[path] = err.message;
      return acc;
    }, {} as Record<string, string>);

    return errorResponse({
      code: ErrorCodes.VALIDATION_ERROR,
      message: 'Validation failed',
      details: formattedErrors,
      statusCode: HttpStatus.BAD_REQUEST
    });
  }

  return errorResponse({
    code: ErrorCodes.VALIDATION_ERROR,
    message: 'Validation failed',
    details: errors,
    statusCode: HttpStatus.BAD_REQUEST
  });
}

/**
 * Authentication error helpers
 */
export function unauthorizedResponse(message?: string): NextResponse<ApiResponse> {
  return errorResponse({
    code: ErrorCodes.UNAUTHORIZED,
    message: message || 'Authentication required',
    statusCode: HttpStatus.UNAUTHORIZED
  });
}

export function forbiddenResponse(message?: string): NextResponse<ApiResponse> {
  return errorResponse({
    code: ErrorCodes.FORBIDDEN,
    message: message || 'Access denied',
    statusCode: HttpStatus.FORBIDDEN
  });
}

/**
 * Resource error helpers
 */
export function notFoundResponse(resource?: string): NextResponse<ApiResponse> {
  return errorResponse({
    code: ErrorCodes.NOT_FOUND,
    message: resource ? `${resource} not found` : 'Resource not found',
    statusCode: HttpStatus.NOT_FOUND
  });
}

export function conflictResponse(message?: string): NextResponse<ApiResponse> {
  return errorResponse({
    code: ErrorCodes.ALREADY_EXISTS,
    message: message || 'Resource already exists',
    statusCode: HttpStatus.CONFLICT
  });
}

/**
 * Rate limiting error helper
 */
export function rateLimitResponse(retryAfter?: number): NextResponse<ApiResponse> {
  const response = errorResponse({
    code: ErrorCodes.RATE_LIMIT_EXCEEDED,
    message: 'Too many requests',
    statusCode: HttpStatus.TOO_MANY_REQUESTS
  });

  if (retryAfter) {
    response.headers.set('Retry-After', retryAfter.toString());
  }

  return response;
}

/**
 * Method not allowed error helper
 */
export function methodNotAllowedResponse(allowedMethods: string[]): NextResponse<ApiResponse> {
  const response = errorResponse({
    code: 'METHOD_NOT_ALLOWED',
    message: `Method not allowed. Allowed methods: ${allowedMethods.join(', ')}`,
    statusCode: HttpStatus.METHOD_NOT_ALLOWED
  });

  response.headers.set('Allow', allowedMethods.join(', '));
  return response;
}

/**
 * Pagination helpers
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  offset?: number;
}

export function parsePaginationParams(searchParams: URLSearchParams): PaginationParams {
  const page = parseInt(searchParams.get('page') || '1');
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100); // Max 100 items
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

export function createPaginationMeta(
  total: number,
  page: number,
  limit: number
): ApiResponse['meta'] {
  const totalPages = Math.ceil(total / limit);
  const hasMore = page < totalPages;

  return {
    total,
    page,
    limit,
    hasMore
  };
}

/**
 * Request validation helper
 */
export async function validateRequest<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ success: true; data: T } | { success: false; response: NextResponse }> {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, response: validationErrorResponse(error) };
    }
    return { 
      success: false, 
      response: errorResponse('Invalid JSON in request body', HttpStatus.BAD_REQUEST) 
    };
  }
}

/**
 * Async error handler wrapper
 */
export function withErrorHandling<T extends any[]>(
  handler: (...args: T) => Promise<NextResponse>
) {
  return async (...args: T): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      console.error('API Error:', error);
      
      // Handle known error types
      if (error instanceof z.ZodError) {
        return validationErrorResponse(error);
      }
      
      // Handle custom API errors
      if (error && typeof error === 'object' && 'code' in error && 'statusCode' in error) {
        return errorResponse(error as ApiError);
      }
      
      // Default error response
      return errorResponse({
        code: ErrorCodes.INTERNAL_ERROR,
        message: 'Internal server error',
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR
      });
    }
  };
}

/**
 * CORS helper
 */
export function withCors(response: NextResponse, allowedOrigins?: string[]): NextResponse {
  const origin = allowedOrigins?.[0] || '*';
  
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Max-Age', '86400');
  
  return response;
}

/**
 * Security headers helper
 */
export function withSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  return response;
}