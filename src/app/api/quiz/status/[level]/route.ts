import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { QuizLevel, levelSlugs } from '@/lib/data';
import { canTakeLevel, countConsecutiveFailures, getRecommendedLevelAfterFailure } from '@/lib/certification';

const ATTEMPTS_PER_BLOCK = 3;
const COOLDOWN_DAYS = 9;

export async function GET(req: NextRequest, { params }: { params: Promise<{ level: string }> }) {
    const resolvedParams = await params;
    const level = resolvedParams.level as QuizLevel;

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const certSlug = levelSlugs[level];

    // Get all user certificates and attempts for prerequisite checking
    const { data: userCertificates } = await supabase
        .from('user_certificates')
        .select('certificate_slug, expires_at')
        .eq('user_id', user.id);

    const { data: allAttempts } = await supabase
        .from('quiz_attempts')
        .select('quiz_level, passed, attempted_at')
        .eq('user_id', user.id)
        .order('attempted_at', { ascending: false });

    // Rule 0: Check level prerequisites (L1 → L2 → L3)
    const levelAccess = canTakeLevel(level, userCertificates || []);
    if (!levelAccess.canTake) {
        return NextResponse.json({
            canTakeQuiz: false,
            reason: levelAccess.reason,
            prerequisiteMissing: levelAccess.prerequisiteMissing,
        });
    }

    // Rule 1: If user has a valid certificate, they cannot retake for 6 months.
    const certificate = userCertificates?.find(cert => cert.certificate_slug === certSlug);
    if (certificate && new Date(certificate.expires_at) > new Date()) {
        return NextResponse.json({
            canTakeQuiz: false,
            reason: 'You have already passed this certificate. You can retake it after it expires.',
            cooldownUntil: new Date(certificate.expires_at).toISOString(),
        });
    }

    // Rule -1: Check failure cascade - if 3+ consecutive failures, recommend level drop
    const consecutiveFailures = countConsecutiveFailures(allAttempts || [], level);
    if (consecutiveFailures >= 3) {
        const recommendation = getRecommendedLevelAfterFailure(level, consecutiveFailures, userCertificates || []);
        if (recommendation.recommendedLevel !== level) {
            return NextResponse.json({
                canTakeQuiz: false,
                reason: recommendation.reason,
                recommendedLevel: recommendation.recommendedLevel,
                consecutiveFailures,
            });
        }
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
        consecutiveFailures: consecutiveFailures,
        hasValidCertificates: (userCertificates || []).some(cert => new Date(cert.expires_at) > new Date()),
    });
}