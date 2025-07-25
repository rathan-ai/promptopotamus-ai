import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { QuizLevel, levelSlugs } from '@/lib/data';
import { QUIZ_CONFIG } from '@/config/constants';

type UserAnswers = { [key: number]: string };

export async function POST(req: NextRequest) {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { level, answers, questions } = await req.json() as { level: QuizLevel; answers: UserAnswers; questions: {id: number}[] };
    const questionIds = Object.keys(answers).map(Number);
    
    const { data: correctAnswers, error: fetchError } = await supabase
        .from('quizzes')
        .select('id, answer, explanation')
        .in('id', questionIds);

    if (fetchError) {
        return NextResponse.json({ error: 'Could not verify answers.' }, { status: 500 });
    }

    let score = 0;
    const results: {questionId: number; correct: boolean; correctAnswer: string; explanation: string | null;}[] = [];

    for (const question of correctAnswers) {
        const isCorrect = answers[question.id] === question.answer;
        if (isCorrect) {
            score++;
        }
        results.push({
            questionId: question.id,
            correct: isCorrect,
            correctAnswer: question.answer,
            explanation: question.explanation
        });
    }
    
    const percentage = (score / questionIds.length) * 100;
    const passed = percentage >= QUIZ_CONFIG.PASSING_SCORE_PERCENTAGE;

    const { data: lastAttempt } = await supabase
        .from('quiz_attempts')
        .select('attempt_number')
        .eq('user_id', user.id)
        .eq('quiz_level', level)
        .order('attempted_at', { ascending: false })
        .limit(1)
        .single();
    
    const currentAttemptNumber = (lastAttempt?.attempt_number || 0) + 1;

    await supabase.from('quiz_attempts').insert({
        user_id: user.id,
        quiz_level: level,
        score: percentage,
        passed: passed,
        attempt_number: currentAttemptNumber,
        questions_data: { questions, userAnswers: answers }
    });

    if (passed) {
        const certificateSlug = levelSlugs[level];
        const earnedAt = new Date();
        const expiresAt = new Date(new Date().setMonth(earnedAt.getMonth() + 6));
        
        const { data: certData, error: certError } = await supabase.from('user_certificates').upsert({
            user_id: user.id,
            certificate_slug: certificateSlug,
            earned_at: new Date().toISOString(),
            expires_at: expiresAt.toISOString()
        }, { onConflict: 'user_id, certificate_slug' }).select('credential_id').single();

        if (certError) {
          return NextResponse.json({ error: 'Could not create certificate.' }, { status: 500 });
        }

        return NextResponse.json({ passed, score: percentage, results, credentialId: certData.credential_id });
    } else {
        if (level === 'master') {
             await supabase.from('user_certificates').delete().match({ user_id: user.id, certificate_slug: 'promptopotamus' });
        }
        if (level === 'intermediate') {
             await supabase.from('user_certificates').delete().match({ user_id: user.id, certificate_slug: 'promptosaur' });
        }
        return NextResponse.json({ passed, score: percentage, results });
    }
}