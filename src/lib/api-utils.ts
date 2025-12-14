import { NextResponse } from 'next/server';

/**
 * Standardized API error response utility
 */
export function createErrorResponse(
  message: string, 
  status: number = 500, 
  details?: Record<string, any>
) {
  return NextResponse.json(
    { 
      error: message,
      ...(details && { details })
    }, 
    { status }
  );
}

/**
 * Standardized API success response utility
 */
export function createSuccessResponse(
  data: any, 
  message?: string, 
  status: number = 200
) {
  return NextResponse.json(
    {
      ...(message && { message }),
      ...data
    },
    { status }
  );
}

/**
 * Common API response patterns
 */
export const ApiResponses = {
  // Authentication errors
  UNAUTHORIZED: () => createErrorResponse('Unauthorized', 401),
  FORBIDDEN: () => createErrorResponse('Forbidden', 403),
  
  // Validation errors
  INVALID_REQUEST: (message: string = 'Invalid request') => 
    createErrorResponse(message, 400),
  MISSING_PARAMS: (params: string[]) => 
    createErrorResponse(`Missing required parameters: ${params.join(', ')}`, 400),
  
  // Resource errors
  NOT_FOUND: (resource: string = 'Resource') => 
    createErrorResponse(`${resource} not found`, 404),
  ALREADY_EXISTS: (resource: string = 'Resource') => 
    createErrorResponse(`${resource} already exists`, 409),
  
  // Server errors
  INTERNAL_ERROR: (message: string = 'Internal server error') => 
    createErrorResponse(message, 500),
  DATABASE_ERROR: (operation: string = 'Database operation') => 
    createErrorResponse(`${operation} failed`, 500),
  
  // Success responses
  SUCCESS: (data?: any, message?: string) => 
    createSuccessResponse(data || {}, message),
  CREATED: (data?: any, message?: string) => 
    createSuccessResponse(data || {}, message, 201),
  DELETED: (message: string = 'Resource deleted successfully') => 
    createSuccessResponse({}, message, 200),
} as const;

/**
 * Database error handler utility
 */
export function handleDatabaseError(error: any, operation: string = 'Database operation') {

  // Common Supabase/PostgreSQL error codes
  if (error.code === '23505') {
    return ApiResponses.ALREADY_EXISTS('Record');
  }
  if (error.code === 'PGRST116') {
    return ApiResponses.NOT_FOUND();
  }
  
  return ApiResponses.DATABASE_ERROR(operation);
}