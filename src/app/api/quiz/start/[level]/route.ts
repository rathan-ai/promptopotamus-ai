import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { QuizLevel } from '@/lib/data';
import { QUIZ_CONFIG } from '@/config/constants';

// The change is in the function signature below
export async function GET(req: NextRequest, { params: paramsPromise }: { params: Promise<{ level: QuizLevel }> }) {
    const params = await paramsPromise; // Await the promise to get the params object
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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