import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { QuizLevel } from '@/lib/data';
import { QUIZ_CONFIG } from '@/config/constants';
import { PROMPTCOIN_COSTS } from '@/lib/promptcoin-utils';
import { shuffleQuestions, randomizeQuizQuestions, type QuizQuestion } from '@/lib/quiz-randomization';

// The change is in the function signature below
export async function GET(req: NextRequest, { params: paramsPromise }: { params: Promise<{ level: QuizLevel }> }) {
    try {
        console.log('Quiz API called');
        const params = await paramsPromise; // Await the promise to get the params object
        console.log('Quiz params:', params);
        
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        console.log('User check:', user ? `User ID: ${user.id}` : 'No user');

        if (!user) {
            console.log('Unauthorized - no user');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check user's PromptCoin balance
        console.log('Checking user profile...');
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
            console.log('Profile error:', profileError);
            return NextResponse.json({ error: 'Failed to check your balance' }, { status: 500 });
        }

        const currentBalance = (profile?.credits_analysis || 0) + 
                              (profile?.credits_enhancement || 0) + 
                              (profile?.credits_exam || 0) + 
                              (profile?.credits_export || 0);

        // TODO: Re-implement PromptCoin deduction once the database function is properly set up
        // For now, allow free exam attempts to fix the loading issue
        console.log(`User ${user.id} starting ${params.level} exam with balance: ${currentBalance}`);
        
        console.log('Fetching quiz questions...');
        const { data: allQuestions, error } = await supabase
            .from('quizzes')
            .select('id, question, options, answer')
            .eq('difficulty', params.level);

        console.log('Quiz query result:', { questionsCount: allQuestions?.length, error });

        if (error || !allQuestions || allQuestions.length === 0) {
            console.log('No questions found or error:', error);
            return NextResponse.json({ error: 'Could not fetch exam questions for this level.' }, { status: 500 });
        }

        if (allQuestions.length < QUIZ_CONFIG.QUIZ_LENGTH) {
            console.log(`Insufficient questions: ${allQuestions.length} < ${QUIZ_CONFIG.QUIZ_LENGTH}`);
            return NextResponse.json({ error: `Not enough questions in the database for this level. Found ${allQuestions.length}, need ${QUIZ_CONFIG.QUIZ_LENGTH}.` }, { status: 500 });
        }

        // Use proper Fisher-Yates shuffle instead of biased Math.random() sort (but keep original format for now)
        console.log('Shuffling questions...');
        const shuffledQuestions = shuffleQuestions(allQuestions);
        const selectedQuestions = shuffledQuestions.slice(0, QUIZ_CONFIG.QUIZ_LENGTH);
        
        console.log('Returning quiz data...');
        return NextResponse.json({ 
            questions: selectedQuestions, 
            timeLimit: QUIZ_CONFIG.TIME_LIMIT_IN_MINUTES * 60 
        });
        
    } catch (error) {
        console.error('Quiz API error:', error);
        return NextResponse.json({ error: 'Server error while starting quiz' }, { status: 500 });
    }
}