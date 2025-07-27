# API Response Standards & Migration Guide

This document outlines the standardized API response patterns implemented in Phase 3 of the architecture refactoring.

## 🎯 Quick Start

```typescript
// Before: Manual error handling
export async function GET() {
  try {
    const data = await fetchData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

// After: Standardized with error wrapper
import { successResponse, withErrorHandling } from '@/lib/api/response';

async function getHandler() {
  const data = await fetchData();
  return successResponse(data);
}

export const GET = withErrorHandling(getHandler);
```

## 📋 Standard Response Format

All API responses follow this consistent structure:

```typescript
interface ApiResponse<T = any> {
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
```

## 🛠 Response Helpers

### Success Responses
```typescript
import { successResponse } from '@/lib/api/response';

// Simple success
return successResponse(userData);

// Success with message
return successResponse(userData, 'User created successfully');

// Success with pagination
return successResponse(users, 'Users retrieved', {
  total: 100,
  page: 1,
  limit: 20,
  hasMore: true
});
```

### Error Responses
```typescript
import { 
  errorResponse,
  unauthorizedResponse,
  forbiddenResponse,
  notFoundResponse,
  validationErrorResponse
} from '@/lib/api/response';

// Generic error
return errorResponse('Something went wrong');

// Authentication required
return unauthorizedResponse();

// Access denied
return forbiddenResponse('Admin access required');

// Resource not found
return notFoundResponse('User');

// Validation errors with Zod
return validationErrorResponse(zodError);
```

### Input Validation
```typescript
import { validateRequest } from '@/lib/api/response';
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1)
});

async function createUserHandler(request: NextRequest) {
  const validation = await validateRequest(request, userSchema);
  if (!validation.success) {
    return validation.response; // Automatic validation error response
  }
  
  const { email, name } = validation.data;
  // Process valid data...
}
```

## 🔒 Error Handling Wrapper

The `withErrorHandling` wrapper provides consistent error handling across all routes:

```typescript
import { withErrorHandling } from '@/lib/api/response';

// Your handler function
async function userHandler(request: NextRequest) {
  // Your business logic here
  // Throw errors normally - they'll be caught and formatted consistently
  if (!userId) {
    throw new Error('User ID required');
  }
  
  return successResponse(userData);
}

// Wrap with error handling
export const GET = withErrorHandling(userHandler);
export const POST = withErrorHandling(userHandler);
```

## 🔄 Migration Patterns

### Pattern 1: Simple GET Route
```typescript
// Before
export async function GET() {
  try {
    const data = await fetchSomething();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// After
import { successResponse, withErrorHandling } from '@/lib/api/response';

async function getHandler() {
  const data = await fetchSomething();
  return successResponse(data);
}

export const GET = withErrorHandling(getHandler);
```

### Pattern 2: POST with Validation
```typescript
// Before
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }
    // Process...
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 500 });
  }
}

// After
import { validateRequest, successResponse, withErrorHandling } from '@/lib/api/response';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email')
});

async function postHandler(request: NextRequest) {
  const validation = await validateRequest(request, schema);
  if (!validation.success) return validation.response;
  
  const { email } = validation.data;
  // Process with validated data...
  return successResponse(result, 'Created successfully');
}

export const POST = withErrorHandling(postHandler);
```

### Pattern 3: Authentication Required
```typescript
// Before
export async function GET() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Continue...
}

// After
import { unauthorizedResponse, successResponse, withErrorHandling } from '@/lib/api/response';

async function getHandler() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return unauthorizedResponse();
  }
  
  // Continue...
  return successResponse(data);
}

export const GET = withErrorHandling(getHandler);
```

## 🎯 Feature-Based Route Organization

Routes are organized by feature domain:

```
src/app/api/
├── auth/              # Authentication routes
│   ├── reset-password/
│   └── callback/
├── payments/          # Payment and billing routes
│   ├── create-intent/
│   └── webhooks/
├── prompts/           # Smart prompts and marketplace
│   ├── featured/
│   └── reviews/
├── profiles/          # User profiles and social features
│   ├── dashboard/
│   └── follow/
├── certificates/      # Certifications and exams
│   └── validate/
├── admin/             # Admin-only routes
│   ├── users/
│   └── stats/
└── system/            # System utilities and health checks
    ├── health/
    └── metrics/
```

## 📊 Pagination Support

Use built-in pagination helpers:

```typescript
import { parsePaginationParams, createPaginationMeta, successResponse } from '@/lib/api/response';

async function getHandler(request: NextRequest) {
  const url = new URL(request.url);
  const { page, limit, offset } = parsePaginationParams(url.searchParams);
  
  const { data, total } = await fetchPaginatedData(offset, limit);
  const meta = createPaginationMeta(total, page, limit);
  
  return successResponse(data, undefined, meta);
}
```

## 🚨 Error Code Standards

Use consistent error codes for client-side handling:

```typescript
import { ErrorCodes } from '@/lib/api/response';

// Business logic errors
if (!hasCredits) {
  return errorResponse({
    code: ErrorCodes.INSUFFICIENT_CREDITS,
    message: 'Not enough PromptCoins',
    statusCode: 402
  });
}

// Rate limiting
if (isRateLimited) {
  return rateLimitResponse(60); // Retry after 60 seconds
}
```

## 🔧 Security Headers

Automatic security headers are applied:

```typescript
import { withSecurityHeaders } from '@/lib/api/response';

// Apply security headers to response
const response = successResponse(data);
return withSecurityHeaders(response);
```

## 📈 Performance Tips

1. **Use Promise.all()** for parallel operations
2. **Implement proper indexing** on database queries
3. **Cache frequently accessed data** where appropriate
4. **Use pagination** for large datasets
5. **Validate early** to avoid unnecessary processing

## 🧪 Testing Responses

Test standardized responses consistently:

```typescript
// Test helper
function expectStandardResponse(response: any) {
  expect(response).toHaveProperty('success');
  expect(typeof response.success).toBe('boolean');
  if (response.success) {
    expect(response).toHaveProperty('data');
  } else {
    expect(response).toHaveProperty('error');
  }
}
```

This standardized approach ensures consistency, maintainability, and better error handling across the entire API surface.