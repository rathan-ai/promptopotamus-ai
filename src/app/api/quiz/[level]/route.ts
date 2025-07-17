// src/app/api/quiz/[level]/route.ts

import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import type { QuizLevel } from '@/lib/data';
import { quizzes } from '@/lib/data/quizzes';

const QUIZ_LENGTH = 25;
const TIME_LIMIT_IN_MINUTES = 25;

// Runtime guard: only let true QuizLevel values through
function isQuizLevel(level: string): level is QuizLevel {
  return Object.keys(quizzes).includes(level);
}

export async function GET(
  req: NextRequest,
  { params }: { params: { level: string } }   // <-- params.level must be string
) {
  const levelParam = params.level;

  // 1) Validate the level
  if (!isQuizLevel(levelParam)) {
    return NextResponse.json(
      { error: `Invalid quiz level: "${levelParam}"` },
      { status: 400 }
    );
  }

  // 2) Auth check
  const supabase = createServerClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 3) Fetch questions
  const { data: allQuestions, error } = await supabase
    .from('quizzes')
    .select('id, question, options')
    .eq('difficulty', levelParam);

  if (error || !allQuestions || allQuestions.length === 0) {
    return NextResponse.json(
      { error: 'Could not fetch exam questions for this level.' },
      { status: 500 }
    );
  }

  // 4) Ensure we have enough questions
  if (allQuestions.length < QUIZ_LENGTH) {
    return NextResponse.json(
      {
        error: `Not enough questions in the database for this level. Found ${allQuestions.length}, need ${QUIZ_LENGTH}.`
      },
      { status: 500 }
    );
  }

  // 5) Shuffle & slice
  const shuffled = allQuestions.sort(() => 0.5 - Math.random());
  const selectedQuestions = shuffled.slice(0, QUIZ_LENGTH);

  // 6) Return payload
  return NextResponse.json({
    questions: selectedQuestions,
    timeLimit: TIME_LIMIT_IN_MINUTES * 60 // seconds
  });
}
