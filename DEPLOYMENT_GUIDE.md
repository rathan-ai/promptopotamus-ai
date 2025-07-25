# 🚀 Production Deployment Guide

## Environment Variables Setup for Live Deployment

Your `.env.local` file works for local development (`npm run dev`), but for production deployment, you need to configure environment variables on your hosting platform.

## 📋 Required Environment Variables

### PayPal (Primary Payment Provider)
```bash
NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_new_paypal_client_id
PAYPAL_CLIENT_SECRET=your_new_paypal_secret_key
PAYPAL_ENVIRONMENT=live
```

### Supabase (Database & Auth)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://qwjrknwzhqymocoikwze.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Stripe (Secondary Payment Provider)
```bash
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
```

### Site Configuration
```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## 🌐 Platform-Specific Setup

### Vercel (Recommended for Next.js)

1. **Deploy to Vercel:**
   ```bash
   npx vercel
   ```

2. **Add Environment Variables:**
   - Go to [vercel.com](https://vercel.com) → Your Project
   - Click **Settings** → **Environment Variables**
   - Add each variable:
     - Name: `NEXT_PUBLIC_PAYPAL_CLIENT_ID`
     - Value: `your_new_paypal_client_id`
     - Environment: **Production**
   - Repeat for all variables above

3. **Redeploy:**
   ```bash
   npx vercel --prod
   ```

### Netlify

1. **Build Settings:**
   ```bash
   # Build command
   npm run build
   
   # Publish directory
   .next
   ```

2. **Environment Variables:**
   - Go to [netlify.com](https://netlify.com) → Your Site
   - **Site Settings** → **Environment Variables**
   - Add each variable from the list above

3. **Deploy:**
   - Push to your connected Git repository
   - Or drag & drop your `.next` folder

### Railway

1. **Deploy:**
   ```bash
   # Connect your GitHub repo or deploy directly
   railway login
   railway link
   railway up
   ```

2. **Environment Variables:**
   - Go to [railway.app](https://railway.app) → Your Project
   - **Variables** tab
   - Add each environment variable

### AWS (EC2/Elastic Beanstalk)

1. **Environment Variables:**
   ```bash
   # Add to your server's environment
   export NEXT_PUBLIC_PAYPAL_CLIENT_ID=your_new_paypal_client_id
   export PAYPAL_CLIENT_SECRET=your_new_paypal_secret_key
   # ... etc
   ```

2. **Or use Elastic Beanstalk Console:**
   - **Configuration** → **Software**
   - Add environment properties

## 🔧 Local vs Production Setup

### Development (.env.local)
```bash
# Local development - use sandbox/test keys
PAYPAL_ENVIRONMENT=sandbox
NEXT_PUBLIC_PAYPAL_CLIENT_ID=sandbox_client_id
STRIPE_SECRET_KEY=sk_test_...
```

### Production (Hosting Platform)
```bash
# Production - use live keys
PAYPAL_ENVIRONMENT=live
NEXT_PUBLIC_PAYPAL_CLIENT_ID=live_client_id
STRIPE_SECRET_KEY=sk_live_...
```

## ✅ Testing Your Deployment

1. **Deploy with environment variables**
2. **Test payment flows:**
   - Pro/Premium subscription upgrades
   - Smart prompt purchases
   - Exam attempt purchases
3. **Check logs for any missing environment variables**
4. **Verify all payment providers appear in payment selection**

## 🔒 Security Checklist

- ✅ Never commit `.env.local` to git
- ✅ Use different credentials for development vs production
- ✅ Keep `PAYPAL_CLIENT_SECRET` and `STRIPE_SECRET_KEY` secure
- ✅ Monitor your PayPal/Stripe dashboards for transactions
- ✅ Set up webhook endpoints for payment confirmations (optional)

## 🆘 Troubleshooting

### Payment Provider Not Showing
- Check environment variables are set correctly
- Verify `PAYPAL_ENVIRONMENT` is set to `live`
- Check browser network tab for API errors

### PayPal Payments Failing
- Confirm new PayPal credentials are active
- Check PayPal Developer Dashboard for app status
- Verify webhook URLs if configured

### Environment Variables Not Loading
- Restart your deployment after adding variables
- Check variable names match exactly (case-sensitive)
- Ensure `NEXT_PUBLIC_` prefix for client-side variables

## 📞 Support

If you encounter issues:
1. Check your hosting platform's logs
2. Verify all environment variables are set
3. Test locally with `npm run dev` first
4. Check PayPal/Stripe dashboards for transaction status