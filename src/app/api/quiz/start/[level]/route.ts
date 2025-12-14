import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { QuizLevel } from '@/lib/data';
import { QUIZ_CONFIG } from '@/config/constants';
import { FEATURE_PRICING } from '@/features/payments/services/payment-constants';
import { shuffleQuestions, randomizeQuizQuestions, type QuizQuestion } from '@/lib/quiz-randomization';

export async function GET(req: NextRequest, { params }: { params: Promise<{ level: QuizLevel }> }) {
    try {
        const resolvedParams = await params;
        // TODO: Consider structured logging for quiz API requests
        // TODO: Consider structured logging for quiz parameters
        
        const supabase = await createServerClient();
        const { data: { user } } = await supabase.auth.getUser();
        // TODO: Consider structured logging for user authentication status

        if (!user) {
            // TODO: Consider security logging for unauthorized quiz attempts
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check user's exam credits
        // TODO: Consider structured logging for profile checks
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
            // TODO: Consider structured logging for profile errors
            return NextResponse.json({ error: 'Failed to check your balance' }, { status: 500 });
        }

        const currentBalance = (profile?.credits_analysis || 0) + 
                              (profile?.credits_enhancement || 0) + 
                              (profile?.credits_exam || 0) + 
                              (profile?.credits_export || 0);

        // Exam credit deduction is handled by the payment system
        // Free exam attempts are allowed for testing
        // TODO: Consider structured logging for exam start events with user metrics
        
        // TODO: Consider structured logging for quiz question fetching
        const { data: allQuestions, error } = await supabase
            .from('quizzes')
            .select('id, question, options, answer')
            .eq('difficulty', resolvedParams.level);

        // TODO: Consider structured logging for quiz query results

        if (error || !allQuestions || allQuestions.length === 0) {
            // TODO: Consider structured logging for quiz question fetch failures
            return NextResponse.json({ error: 'Could not fetch exam questions for this level.' }, { status: 500 });
        }

        if (allQuestions.length < QUIZ_CONFIG.QUIZ_LENGTH) {
            // TODO: Consider structured logging for insufficient questions scenario
            return NextResponse.json({ error: `Not enough questions in the database for this level. Found ${allQuestions.length}, need ${QUIZ_CONFIG.QUIZ_LENGTH}.` }, { status: 500 });
        }

        // Shuffle questions AND randomize answer positions
        // TODO: Consider structured logging for question shuffling process
        const shuffledQuestions = shuffleQuestions(allQuestions);
        const selectedQuestions = shuffledQuestions.slice(0, QUIZ_CONFIG.QUIZ_LENGTH);
        
        // Randomize answer positions within each question
        // TODO: Consider structured logging for answer randomization process
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
        
        // TODO: Consider structured logging for successful quiz data preparation
        return NextResponse.json({ 
            questions: randomizedQuestions, 
            timeLimit: QUIZ_CONFIG.TIME_LIMIT_IN_MINUTES * 60 
        });
        
    } catch (error) {
        console.error('Quiz API error:', error);
        return NextResponse.json({ error: 'Server error while starting quiz' }, { status: 500 });
    }
}