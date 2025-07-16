import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch all necessary data for the dashboard in parallel
    const [
        { data: attempts, error: attemptsError },
        { data: prompts, error: promptsError },
        { data: certificates, error: certsError },
        { data: profile, error: profileError }
    ] = await Promise.all([
        supabase.from('quiz_attempts').select('*').eq('user_id', user.id).order('attempted_at', { ascending: false }),
        supabase.from('saved_prompts').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('user_certificates').select('*').eq('user_id', user.id).order('earned_at', { ascending: false }),
        supabase.from('profiles').select('*').eq('id', user.id).single()
    ]);

    if (attemptsError || promptsError || certsError || profileError) {
        console.error({ attemptsError, promptsError, certsError, profileError });
        return NextResponse.json({ error: 'Failed to fetch dashboard data.' }, { status: 500 });
    }

    return NextResponse.json({ attempts, prompts, certificates, profile });
}