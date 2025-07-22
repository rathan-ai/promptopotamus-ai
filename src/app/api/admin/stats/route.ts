import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Fetch comprehensive stats in parallel
    const [
        { count: totalUsers, error: usersError },
        { count: totalCertificates, error: certsError },
        { count: newsletterSubscribers, error: newsletterError },
        { count: quizAttempts, error: quizError },
        { count: savedPrompts, error: promptsError },
        { count: affiliateResources, error: affiliateError }
    ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('user_certificates').select('*', { count: 'exact', head: true }),
        supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }),
        supabase.from('quiz_attempts').select('*', { count: 'exact', head: true }),
        supabase.from('saved_prompts').select('*', { count: 'exact', head: true }),
        supabase.from('affiliate_resources').select('*', { count: 'exact', head: true })
    ]);

    // Get subscription stats
    const { data: subscriptionStats, error: subscriptionError } = await supabase
        .from('profiles')
        .select('subscription_tier, subscription_status');

    if (usersError || certsError || newsletterError || quizError || promptsError || affiliateError || subscriptionError) {
        return NextResponse.json({ error: 'Failed to fetch admin stats.' }, { status: 500 });
    }

    // Calculate subscription breakdown
    const subscriptionBreakdown = {
        free: subscriptionStats?.filter(u => u.subscription_tier === 'free').length || 0,
        pro: subscriptionStats?.filter(u => u.subscription_tier === 'pro').length || 0,
        premium: subscriptionStats?.filter(u => u.subscription_tier === 'premium').length || 0,
        active: subscriptionStats?.filter(u => u.subscription_status === 'active').length || 0,
        inactive: subscriptionStats?.filter(u => u.subscription_status === 'inactive').length || 0
    };

    return NextResponse.json({ 
        totalUsers, 
        totalCertificates,
        newsletterSubscribers,
        quizAttempts,
        savedPrompts,
        affiliateResources,
        subscriptionBreakdown
    });
}