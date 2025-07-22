# Admin Setup Guide: Affiliate Management & User Subscriptions

## Overview
This implementation provides a complete admin dashboard for managing affiliate links and user subscriptions, eliminating the need to modify code for affiliate management.

## 🗄️ Database Setup

### 1. Run Migrations
Execute these SQL files in your Supabase dashboard or via SQL editor:

```sql
-- File: migrations/001_create_affiliate_resources.sql
-- Creates affiliate_resources table with all existing data migrated
```

```sql
-- File: migrations/002_add_subscription_fields.sql
-- Adds subscription management fields to profiles table
-- Creates subscription_transactions table for payment tracking
```

### 2. Database Schema

#### affiliate_resources table:
- `id` - Primary key
- `name` - Resource name (e.g., "ChatGPT Plus")
- `provider` - Company name (e.g., "OpenAI")
- `description` - Resource description
- `price` - Display price (e.g., "$20/month")
- `category` - Resource category
- `badge` - Display badge (e.g., "Most Popular")
- `color` - CSS color class
- `icon` - Emoji icon
- `affiliate_link` - Full affiliate URL
- `features` - JSON array of features
- `rating` - Decimal rating (1-5)
- `is_active` - Boolean visibility
- `display_order` - Sort order

#### profiles table (enhanced):
- `subscription_tier` - 'free', 'pro', or 'premium'
- `subscription_status` - 'inactive', 'active', 'cancelled', 'expired'
- `subscription_start_date` - Subscription start
- `subscription_end_date` - Subscription end
- `payment_method` - Payment method used
- `stripe_customer_id` - Stripe customer reference

## 🔧 Admin Interface

### Access Admin Dashboard
1. Navigate to `/admin` (requires admin role)
2. Use the tabbed interface to switch between:
   - **Dashboard**: User management and statistics
   - **Affiliate Manager**: Complete affiliate resource management

### Affiliate Management Features
✅ **Create New Affiliates**: Add affiliate resources with full details  
✅ **Edit Existing**: Update any affiliate resource fields  
✅ **Delete Affiliates**: Remove affiliate resources  
✅ **Toggle Visibility**: Enable/disable affiliates without deletion  
✅ **Reorder Display**: Set custom display order  
✅ **Link Validation**: Automatic URL validation  
✅ **Rich Features**: JSON array management for features  

### User Subscription Management
✅ **View All Subscriptions**: See all user subscription statuses  
✅ **Update User Tiers**: Change user subscription levels  
✅ **Manage Status**: Update subscription status  
✅ **Payment Tracking**: View payment transaction history  

## 🌐 Public API Endpoints

### Affiliate Resources
- `GET /api/affiliates` - Fetch active affiliate resources for public display
- Used by resources page to dynamically load affiliate links

### Admin-Only Endpoints  
- `GET /api/admin/affiliates` - Fetch all affiliates (admin only)
- `POST /api/admin/affiliates` - Create new affiliate
- `PUT /api/admin/affiliates` - Update existing affiliate  
- `DELETE /api/admin/affiliates` - Delete affiliate

## 💳 Payment Integration Setup

### Current Implementation
- Email-based payment requests to `payment@innorag.com`
- Payment intent API structure ready for Stripe integration
- Transaction tracking in database

### Stripe Integration (Next Steps)
1. Install Stripe SDK: `npm install stripe`
2. Set environment variables:
   ```env
   STRIPE_SECRET_KEY=sk_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```
3. Uncomment Stripe code in `/api/create-payment-intent`
4. Set up Stripe webhooks for payment events
5. Configure product pricing in Stripe dashboard

## 🔒 Subscription Access Control

### Usage Limits by Tier
```typescript
// Free Tier
- 3 prompt enhancements
- 5 prompt analyses  
- Access to free templates only

// Pro Tier ($9/month)
- Unlimited prompt enhancements
- Unlimited prompt analyses
- Access to Pro templates
- Export features
- Priority support

// Premium Tier ($19/month)  
- All Pro features
- Access to Premium templates
- Custom template creation
- Team collaboration
- Advanced analytics
- 1-on-1 consultation
```

### Subscription Checking
Use the `getUserSubscription()` function to check user access:

```typescript
import { getUserSubscription, hasFeatureAccess } from '@/lib/subscription';

const subscription = await getUserSubscription(userId);
const canAccessPro = hasFeatureAccess(subscription, 'pro');
```

## 📊 Analytics Integration

All affiliate clicks and subscription interactions are tracked with Vercel Analytics:
- `affiliate_click_resource` - Affiliate link clicks from resources page
- `upgrade_plan_selected` - Plan selection in upgrade modal
- `upgrade_attempt` - Subscription upgrade attempts
- `upgrade_contact_initiated` - Email contact initiated

## 🚀 How Payment Activation Works

### Current Email Flow:
1. User clicks "Choose Pro/Premium" in upgrade modal
2. System opens email client with pre-filled message to `payment@innorag.com`
3. User sends email with plan request
4. **Manual Admin Process**: 
   - Check payment via your preferred method
   - Log into `/admin` dashboard
   - Navigate to **Dashboard** tab → **User Management**
   - Find the user who paid
   - **Manually update their subscription tier** from 'free' to 'pro'/'premium'
   - Set subscription status to 'active'
   - Set start/end dates

### Future Automated Flow (with Stripe):
1. User selects plan and pays via Stripe
2. Stripe webhook automatically updates user subscription
3. User immediately gains access to premium features

## 🎯 Key Benefits Delivered

### For Admin Management:
✅ **No Code Changes**: Update affiliate links via admin dashboard  
✅ **Complete Control**: Add, edit, delete, reorder affiliate resources  
✅ **User Management**: View and update user subscriptions  
✅ **Payment Tracking**: Monitor all subscription transactions  

### For User Experience:
✅ **Dynamic Content**: Resources page loads from database  
✅ **Consistent Upgrade Flow**: Professional upgrade modals across app  
✅ **Feature Gating**: Proper access control based on subscription tier  
✅ **Analytics Tracking**: Complete funnel tracking for business insights  

## ⚡ Next Steps Recommendations

1. **Set up Stripe**: Complete payment automation
2. **Run Migrations**: Execute SQL files in Supabase
3. **Test Affiliate Management**: Add/edit affiliates via admin dashboard  
4. **Test Payment Flow**: Try upgrade process and manual subscription activation
5. **Monitor Analytics**: Track conversion funnel performance

The system is production-ready with email-based payments and can be seamlessly upgraded to automated Stripe payments when ready.