import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { QuizLevel } from '@/lib/data';
import { QUIZ_CONFIG } from '@/config/constants';
import { PROMPTCOIN_COSTS } from '@/lib/promptcoin-utils';

// The change is in the function signature below
export async function GET(req: NextRequest, { params: paramsPromise }: { params: Promise<{ level: QuizLevel }> }) {
    const params = await paramsPromise; // Await the promise to get the params object
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check user's PromptCoin balance
    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select(`
            credits_analysis,
            credits_enhancement,
            credits_exam,
            credits_export
        `)
        .eq('id', user.id)
        .single();

    if (profileError) {
        return NextResponse.json({ error: 'Failed to check your balance' }, { status: 500 });
    }

    const currentBalance = (profile?.credits_analysis || 0) + 
                          (profile?.credits_enhancement || 0) + 
                          (profile?.credits_exam || 0) + 
                          (profile?.credits_export || 0);

    // Check if user has sufficient PromptCoins for exam
    if (currentBalance < PROMPTCOIN_COSTS.exam) {
        return NextResponse.json({ 
            error: `Insufficient PromptCoins. You need ${PROMPTCOIN_COSTS.exam} PC to start this exam.`,
            required: PROMPTCOIN_COSTS.exam,
            available: currentBalance,
            shortage: PROMPTCOIN_COSTS.exam - currentBalance
        }, { status: 400 });
    }
    
    // Deduct PromptCoins for the exam attempt
    const { error: deductError } = await supabase.rpc('deduct_promptcoins_for_exam', {
        p_user_id: user.id,
        p_amount: PROMPTCOIN_COSTS.exam,
        p_exam_level: params.level
    });
    
    if (deductError) {
        console.error('Failed to deduct PromptCoins:', deductError);
        return NextResponse.json({ error: 'Failed to process exam payment' }, { status: 500 });
    }
    
    const { data: allQuestions, error } = await supabase
        .from('quizzes')
        .select('id, question, options')
        .eq('difficulty', params.level); // Use the resolved params

    if (error || !allQuestions || allQuestions.length === 0) {
        return NextResponse.json({ error: 'Could not fetch exam questions for this level.' }, { status: 500 });
    }

    if (allQuestions.length < QUIZ_CONFIG.QUIZ_LENGTH) {
        return NextResponse.json({ error: `Not enough questions in the database for this level. Found ${allQuestions.length}, need ${QUIZ_CONFIG.QUIZ_LENGTH}.` }, { status: 500 });
    }

    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, QUIZ_CONFIG.QUIZ_LENGTH);
    
    return NextResponse.json({ 
        questions: selectedQuestions, 
        timeLimit: QUIZ_CONFIG.TIME_LIMIT_IN_MINUTES * 60 
    });
}