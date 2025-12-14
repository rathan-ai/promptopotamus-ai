import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { QuizLevel } from '@/lib/data';
import { shuffleQuestions, randomizeQuizQuestions, type QuizQuestion } from '@/lib/quiz-randomization';

const QUIZ_LENGTH = 25;
const TIME_LIMIT_IN_MINUTES = 25;

export async function GET(req: NextRequest, { params }: { params: Promise<{ level: string }> }) {
    const resolvedParams = await params;
    const level = resolvedParams.level as QuizLevel;

    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { data: allQuestions, error } = await supabase
        .from('quizzes')
        .select('id, question, options, answer')
        .eq('difficulty', level);

    if (error || !allQuestions || allQuestions.length === 0) {
        return NextResponse.json({ error: 'Could not fetch exam questions for this level.' }, { status: 500 });
    }

    if (allQuestions.length < QUIZ_LENGTH) {
        return NextResponse.json({ error: `Not enough questions in the database for this level. Found ${allQuestions.length}, need ${QUIZ_LENGTH}.` }, { status: 500 });
    }

    // Use proper Fisher-Yates shuffle instead of biased Math.random() sort (but keep original format for now)
    const shuffledQuestions = shuffleQuestions(allQuestions);
    const selectedQuestions = shuffledQuestions.slice(0, QUIZ_LENGTH);
    
    // For now, just return the questions without option randomization to fix the loading issue
    // TODO: Implement secure option randomization with server-side answer mapping
    
    return NextResponse.json({ 
        questions: selectedQuestions, 
        timeLimit: TIME_LIMIT_IN_MINUTES * 60 
    });
}