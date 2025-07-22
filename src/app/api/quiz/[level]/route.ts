import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { QuizLevel } from '@/lib/data';

const QUIZ_LENGTH = 25;
const TIME_LIMIT_IN_MINUTES = 25;

export async function GET(req: NextRequest, { params }: { params: Promise<{ level: QuizLevel }> }) {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { level } = await params;
    
    const { data: allQuestions, error } = await supabase
        .from('quizzes')
        .select('id, question, options')
        .eq('difficulty', level);

    if (error || !allQuestions || allQuestions.length === 0) {
        return NextResponse.json({ error: 'Could not fetch exam questions for this level.' }, { status: 500 });
    }

    if (allQuestions.length < QUIZ_LENGTH) {
        return NextResponse.json({ error: `Not enough questions in the database for this level. Found ${allQuestions.length}, need ${QUIZ_LENGTH}.` }, { status: 500 });
    }

    const shuffled = allQuestions.sort(() => 0.5 - Math.random());
    const selectedQuestions = shuffled.slice(0, QUIZ_LENGTH);
    
    return NextResponse.json({ 
        questions: selectedQuestions, 
        timeLimit: TIME_LIMIT_IN_MINUTES * 60 
    });
}