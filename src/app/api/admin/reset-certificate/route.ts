import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { levelSlugs } from '@/lib/data';

const findKeyByValue = (obj: Record<string, string>, value: string) => {
  return Object.keys(obj).find(key => obj[key] === value);
};

export async function POST(req: Request) {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    
    const { userId, certSlug } = await req.json();
    if (!userId || !certSlug) return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });

    const quizLevel = findKeyByValue(levelSlugs, certSlug);
    if (!quizLevel) return NextResponse.json({ error: 'Invalid certificate slug.' }, { status: 400 });

    // Delete the certificate and all related quiz attempts for that user and level
    const { error: certError } = await supabase.from('user_certificates').delete().match({ user_id: userId, certificate_slug: certSlug });
    const { error: attemptsError } = await supabase.from('quiz_attempts').delete().match({ user_id: userId, quiz_level: quizLevel });

    if (certError || attemptsError) {
        return NextResponse.json({ error: 'Failed to reset certificate and attempts.' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true, message: 'Certificate and attempts have been reset successfully.' });
}