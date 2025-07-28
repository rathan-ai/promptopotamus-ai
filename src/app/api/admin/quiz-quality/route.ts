import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateQuizQualityReport, analyzeAnswerDistribution, type QuizQuestion } from '@/lib/quiz-randomization';

export async function GET() {
  try {
    const supabase = await createServerClient();
    
    // Check if user is authenticated (you may want to add admin role check)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Fetch all quiz questions
    const { data: allQuestions, error } = await supabase
      .from('quizzes')
      .select('id, question, options, answer, difficulty');
    
    if (error) {
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
    }
    
    // Generate comprehensive quality report
    const qualityReport = generateQuizQualityReport(allQuestions as QuizQuestion[]);
    
    // Additional analysis by difficulty level
    const difficultyAnalysis = {
      beginner: 0,
      intermediate: 0,
      master: 0
    };
    
    allQuestions?.forEach(q => {
      if (q.difficulty in difficultyAnalysis) {
        difficultyAnalysis[q.difficulty as keyof typeof difficultyAnalysis]++;
      }
    });
    
    // Answer position distribution analysis
    const positionAnalysis = analyzeAnswerDistribution(allQuestions as QuizQuestion[]);
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      totalQuestions: allQuestions?.length || 0,
      difficultyBreakdown: difficultyAnalysis,
      qualityReport,
      answerPositionAnalysis: {
        distribution: positionAnalysis.distribution,
        isBalanced: positionAnalysis.isBalanced,
        bias: positionAnalysis.bias,
        recommendation: positionAnalysis.isBalanced 
          ? 'Answer distribution is well balanced' 
          : 'Consider reviewing answer positions to reduce bias'
      }
    });
    
  } catch (error) {
    console.error('Quiz quality analysis error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}