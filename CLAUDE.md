# Promptopotamus AI - Claude Configuration

## Project Overview
Promptopotamus is an AI-powered prompt engineering platform built with Next.js, Supabase, and deployed on Vercel. The platform features a Smart Recipes marketplace and comprehensive prompt analysis tools.

## Architecture

### Frontend
- **Framework**: Next.js 15.4.1 with App Router
- **Styling**: Tailwind CSS 4.0
- **Components**: Custom UI components with Radix UI primitives
- **State Management**: Jotai for client-side state
- **Analytics**: Vercel Analytics integration

### Backend
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Supabase Auth with social providers
- **Payment Processing**: Universal Payment Adapter (Stripe, PayPal)
- **API Routes**: Next.js API routes with enterprise security

### Deployment
- **Platform**: Vercel
- **Environment**: Production, Preview, Development
- **Domain**: promptopotamus.com
- **CDN**: Vercel Edge Network

## Database Schema

### Core Tables
- `profiles` - User profiles and subscription information
- `saved_prompts` - Prompt templates and Smart Recipes
- `smart_prompt_purchases` - Marketplace transactions
- `payment_security_events` - Security monitoring and fraud detection

### Key Features
- **Smart Recipes Marketplace**: User-generated prompt templates with direct USD pricing
- **Security Monitoring**: Comprehensive audit trails and fraud detection
- **Webhook Integration**: Secure Stripe and PayPal webhook handling

## Code Standards

### File Organization
- Components in `/src/components/` with TypeScript
- API routes in `/src/app/api/` following RESTful patterns
- Database utilities in `/src/lib/`
- Type definitions in `/src/types/`

### Code Style
- **TypeScript**: Strict mode enabled
- **Naming**: camelCase for variables, PascalCase for components
- **Imports**: Absolute imports with `@/` alias
- **Comments**: JSDoc for functions, inline for complex logic
- **Security**: Never expose API keys, use environment variables

### Component Patterns
```typescript
// Preferred component structure
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface ComponentProps {
  // Props with proper typing
}

export default function ComponentName({ }: ComponentProps) {
  // Component logic
  return (
    // JSX with proper accessibility
  );
}
```

### Database Operations
- Use Supabase client with proper RLS policies
- Always handle errors gracefully
- Log security events for payment operations
- Use transactions for atomic operations

## Environment Variables

### Required
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`

### Payment Processing
- `STRIPE_SECRET_KEY` & `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `PAYPAL_CLIENT_ID` & `PAYPAL_CLIENT_SECRET`
- `PAYPAL_WEBHOOK_ID`

### Development
- Use `.env.local` for local development
- Never commit API keys to repository
- Use Vercel environment variables for production

## Security Requirements

### Payment Security
- All payment operations must be logged to `payment_security_events`
- Rate limiting: 5 purchases per minute per user
- Webhook signature verification required
- Idempotency keys for duplicate prevention

### Data Protection
- Row Level Security enabled on all user data
- Audit trails for payment transactions
- Secure error handling without information leakage
- HTTPS-only in production

## Performance Standards

### Core Web Vitals Targets
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1

### Database Performance
- Proper indexing on frequently queried columns
- Efficient queries with minimal N+1 problems
- Connection pooling and query optimization

## Deployment Process

### Automated Deployment
1. Push to `main` branch triggers Vercel deployment
2. Database migrations run automatically via SQL scripts
3. Environment variables synced from Vercel dashboard
4. Webhook endpoints tested post-deployment

### Manual Tasks
- Database migrations via Supabase SQL Editor
- Environment variable updates in Vercel dashboard
- PayPal webhook configuration in PayPal Developer Console

## Common Tasks

### Adding New Features
1. Create database migrations if needed
2. Add proper TypeScript types
3. Implement with security logging
4. Add proper error handling
5. Update documentation

### Payment Integration
1. Add new payment provider to Universal Payment Adapter
2. Implement webhook handler with signature verification
3. Add security event logging
4. Test with sandbox/test environments
5. Update environment variable documentation

### Database Changes
1. Create migration script in `/migrations/`
2. Test on development environment first
3. Apply to production via Supabase SQL Editor
4. Update type definitions if needed
5. Document schema changes

## Troubleshooting

### Common Issues
- **Build Failures**: Check environment variable configuration
- **Payment Errors**: Verify webhook endpoints and signatures
- **Database Errors**: Check RLS policies and permissions
- **Performance Issues**: Review database queries and indexing

### Debug Tools
- Vercel deployment logs
- Supabase database logs
- Browser developer tools
- Vercel Analytics for performance monitoring

## AI Assistant Guidelines

### Helpful Context
- Focus on marketplace features and direct USD payments
- Maintain enterprise-grade security standards
- Follow existing code patterns and conventions
- Consider performance implications of database queries
- Always handle errors gracefully

### Preferred Responses
- Provide complete, working code examples
- Include proper TypeScript typing
- Add security considerations for payment operations
- Suggest performance optimizations when relevant
- Follow the existing file organization patterns

---

*This configuration helps Claude understand the Promptopotamus platform architecture and maintain consistency with established patterns and security requirements.*