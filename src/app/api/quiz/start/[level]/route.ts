import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { QuizLevel } from '@/lib/data';
import { QUIZ_CONFIG } from '@/config/constants';
import { FEATURE_PRICING } from '@/features/payments/services/payment-constants';
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

        // Shuffle questions AND randomize answer positions
        console.log('Shuffling questions...');
        const shuffledQuestions = shuffleQuestions(allQuestions);
        const selectedQuestions = shuffledQuestions.slice(0, QUIZ_CONFIG.QUIZ_LENGTH);
        
        // Randomize answer positions within each question
        console.log('Randomizing answer positions...');
        const randomizedQuestions = selectedQuestions.map(question => {
            // Store the correct answer text before shuffling
            const correctAnswer = question.answer;
            
            // Create a copy of options array and shuffle it
            const shuffledOptions = [...question.options];
            for (let i = shuffledOptions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
            }
            
            // Return question with shuffled options (but don't include the answer to prevent cheating)
            return {
                id: question.id,
                question: question.question,
                options: shuffledOptions
                // Don't send the answer to the client
            };
        });
        
        console.log('Returning quiz data...');
        return NextResponse.json({ 
            questions: randomizedQuestions, 
            timeLimit: QUIZ_CONFIG.TIME_LIMIT_IN_MINUTES * 60 
        });
        
    } catch (error) {
        console.error('Quiz API error:', error);
        return NextResponse.json({ error: 'Server error while starting quiz' }, { status: 500 });
    }
}