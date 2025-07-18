import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { QuizLevel, levelSlugs } from '@/lib/data';

const ATTEMPTS_PER_BLOCK = 3;
const COOLDOWN_DAYS = 9;

export async function GET(req: NextRequest, { params }: { params: { level: QuizLevel } }) {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { level } = params;
    const certSlug = levelSlugs[level];

    // NEW: Prerequisite check
    if (level === 'intermediate') {
        const { data: beginnerCert } = await supabase
            .from('user_certificates')
            .select('id')
            .eq('user_id', user.id)
            .eq('certificate_slug', 'promptling')
            .single();
        if (!beginnerCert) {
            return NextResponse.json({ canTakeQuiz: false, reason: 'You must pass the Beginner exam before attempting the Intermediate exam.' });
        }
    } else if (level === 'master') {
        const { data: intermediateCert } = await supabase
            .from('user_certificates')
            .select('id')
            .eq('user_id', user.id)
            .eq('certificate_slug', 'promptosaur')
            .single();
        if (!intermediateCert) {
            return NextResponse.json({ canTakeQuiz: false, reason: 'You must pass the Intermediate exam before attempting the Master exam.' });
        }
    }

    // If user has a certificate for this level, check if it's still valid (not expired).
    const { data: certificate } = await supabase
        .from('user_certificates')
        .select('expires_at')
        .eq('user_id', user.id)
        .eq('certificate_slug', certSlug)
        .single();
    
    if (certificate && new Date(certificate.expires_at) > new Date()) {
        return NextResponse.json({
            canTakeQuiz: false,
            reason: 'You have already passed this certificate. You can retake it after it expires.',
            cooldownUntil: new Date(certificate.expires_at).toISOString(),
        });
    }
    
    // --- The rest of the logic for attempts and cooldowns remains the same ---
    const { data: profile } = await supabase.from('profiles').select('purchased_attempts').eq('id', user.id).single();
    const { data: attempts, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select('attempted_at')
        .eq('user_id', user.id)
        .eq('quiz_level', level)
        .order('attempted_at', { ascending: true });

    if (attemptsError || !profile) {
        return NextResponse.json({ error: "Could not retrieve user attempt history." }, { status: 500 });
    }
    
    const attemptsMade = attempts.length;
    const purchaseCount = profile.purchased_attempts?.[level] || 0;
    const completedBlocks = Math.floor(attemptsMade / ATTEMPTS_PER_BLOCK);
    const freeBlocks = 1;
    const totalEntitledBlocks = freeBlocks + purchaseCount;

    if (completedBlocks >= totalEntitledBlocks) {
        const lastAttempt = new Date(attempts[attemptsMade - 1].attempted_at);
        const cooldownDate = new Date(lastAttempt.setDate(lastAttempt.getDate() + COOLDOWN_DAYS));

        if (new Date() < cooldownDate) {
            return NextResponse.json({
                canTakeQuiz: false,
                reason: `You may purchase more attempts now, or wait for the ${COOLDOWN_DAYS}-day cooldown to end.`,
                cooldownUntil: cooldownDate.toISOString(),
                needsPayment: true,
                purchaseCount: purchaseCount,
            });
        }
    }
    
    const attemptsInCurrentBlock = attemptsMade % ATTEMPTS_PER_BLOCK;
    return NextResponse.json({ 
        canTakeQuiz: true, 
        reason: null, 
        attemptsMade: attemptsInCurrentBlock, 
        totalAllowed: ATTEMPTS_PER_BLOCK,
        attemptType: completedBlocks < freeBlocks ? 'free' : 'purchased',
        purchaseCount: purchaseCount,
    });
}