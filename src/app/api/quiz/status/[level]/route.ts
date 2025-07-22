import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { QuizLevel, levelSlugs } from '@/lib/data';

const ATTEMPTS_PER_BLOCK = 3;
const COOLDOWN_DAYS = 9;

// The change is in the function signature below
export async function GET(req: NextRequest, { params: paramsPromise }: { params: Promise<{ level: QuizLevel }> }) {
    const params = await paramsPromise; // Await the promise to get the params object
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { level } = params; // Use the resolved params
    const certSlug = levelSlugs[level];

    // Rule 1: If user has a valid certificate, they cannot retake for 6 months.
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

    // Rule 2 & 3: Handle attempt blocks, cooldowns, and purchases.
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