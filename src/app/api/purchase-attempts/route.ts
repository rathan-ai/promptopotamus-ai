import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { level } = await req.json();
    if (!level) {
        return NextResponse.json({ error: 'Level not specified.' }, { status: 400 });
    }
    
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('purchased_attempts')
      .eq('id', user.id)
      .single();

    if (profileError) {
      return NextResponse.json({ error: 'Could not find user profile.' }, { status: 500 });
    }

    const newPurchasedAttempts = profile.purchased_attempts || {};
    newPurchasedAttempts[level] = (newPurchasedAttempts[level] || 0) + 1;

    const { error: updateError } = await supabase
        .from('profiles')
        .update({ purchased_attempts: newPurchasedAttempts })
        .eq('id', user.id);

    if (updateError) {
        return NextResponse.json({ error: 'Failed to update attempts.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Successfully purchased 3 more attempts!' });
}