import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { isAdmin } from '@/lib/auth';

// GET - Fetch user subscriptions for admin management
export async function GET() {
    const supabase = await createServerClient();
    if (!(await isAdmin(supabase))) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: profiles, error } = await supabase
        .from('profiles')
        .select(`
            id,
            full_name,
            subscription_tier,
            subscription_status,
            subscription_start_date,
            subscription_end_date,
            payment_method,
            subscription_updated_at,
            user:id(email)
        `)
        .order('subscription_updated_at', { ascending: false, nullsFirst: false });

    if (error) {
        return NextResponse.json({ error: `Failed to fetch subscriptions: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json(profiles);
}

// POST - Update user subscription
export async function POST(request: Request) {
    const supabase = await createServerClient();
    if (!(await isAdmin(supabase))) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const body = await request.json();
        const {
            userId,
            subscription_tier,
            subscription_status,
            subscription_start_date,
            subscription_end_date,
            payment_method,
            stripe_customer_id
        } = body;

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
        }

        // Validate subscription tier
        const validTiers = ['free', 'pro', 'premium'];
        if (subscription_tier && !validTiers.includes(subscription_tier)) {
            return NextResponse.json({ error: 'Invalid subscription tier' }, { status: 400 });
        }

        // Validate subscription status
        const validStatuses = ['inactive', 'active', 'cancelled', 'expired'];
        if (subscription_status && !validStatuses.includes(subscription_status)) {
            return NextResponse.json({ error: 'Invalid subscription status' }, { status: 400 });
        }

        const updateData: Record<string, unknown> = {};
        if (subscription_tier !== undefined) updateData.subscription_tier = subscription_tier;
        if (subscription_status !== undefined) updateData.subscription_status = subscription_status;
        if (subscription_start_date !== undefined) updateData.subscription_start_date = subscription_start_date;
        if (subscription_end_date !== undefined) updateData.subscription_end_date = subscription_end_date;
        if (payment_method !== undefined) updateData.payment_method = payment_method;
        if (stripe_customer_id !== undefined) updateData.stripe_customer_id = stripe_customer_id;

        const { data: profile, error: updateError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', userId)
            .select()
            .single();

        if (updateError) {
            return NextResponse.json({ error: `Failed to update subscription: ${updateError.message}` }, { status: 500 });
        }

        return NextResponse.json({ message: 'Subscription updated successfully', profile });
    } catch (error) {
        return NextResponse.json({ 
            error: `Invalid request body: ${error instanceof Error ? error.message : 'Unknown error'}` 
        }, { status: 400 });
    }
}