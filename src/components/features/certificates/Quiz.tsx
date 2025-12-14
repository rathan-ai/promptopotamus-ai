'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Loader2, Timer, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface Question {
  id: number;
  question: string;
  options: string[];
}

interface Result {
    questionId: number;
    correct: boolean;
    correctAnswer: string;
    explanation: string | null;
}

const levelTitleMap: Record<string, string> = {
    'beginner': 'Beginner Certification Exam',
    'intermediate': 'Intermediate Certification Exam',
    'master': 'Master Certification Exam'
};

export default function Quiz({ level }: { level: string }) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [quizState, setQuizState] = useState<'loading' | 'active' | 'submitting' | 'passed' | 'failed'>('loading');
    const [error, setError] = useState('');
    const [results, setResults] = useState<{ passed: boolean; score: number; results: Result[]; credentialId?: string } | null>(null);
    const router = useRouter();

    const submitQuiz = useCallback(async () => {
        if (quizState === 'submitting') return;
        setQuizState('submitting');
        
        const res = await fetch('/api/quiz/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ level, answers: userAnswers, questions }),
        });
        
        const resultData = await res.json();
        setResults(resultData);

        if (resultData.passed) {
            setQuizState('passed');
            toast.success("Congratulations! You passed the exam.");
            setTimeout(() => {
                if (resultData.credentialId) {
                    router.push(`/certificates/view/${resultData.credentialId}`);
                } else {
                    router.push('/dashboard');
                }
            }, 2500);
        } else {
            setQuizState('failed');
        }

    }, [level, userAnswers, questions, quizState, router]);

    useEffect(() => {
        const startQuiz = async () => {
            try {
                // TODO: Consider structured logging for quiz start events
                const res = await fetch(`/api/quiz/start/${level}`);
                // TODO: Consider structured logging for quiz API response status
                
                if (!res.ok) {
                    const data = await res.json();
                    console.error('Quiz API error:', data);
                    setError(data.error || 'Failed to start the exam. You may not be eligible.');
                    setQuizState('loading');
                    return;
                }
                
                const data = await res.json();
                // TODO: Consider structured logging for quiz data reception
                
                if (!data.questions || data.questions.length === 0) {
                    setError('No questions available for this exam level.');
                    setQuizState('loading');
                    return;
                }
                
                setQuestions(data.questions);
                setTimeLeft(data.timeLimit);
                setQuizState('active');
            } catch (error) {
                console.error('Quiz fetch error:', error);
                setError('Network error while starting the exam. Please try again.');
                setQuizState('loading');
            }
        };
        startQuiz();
    }, [level]);

    useEffect(() => {
        if (quizState !== 'active' || !questions || questions.length === 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    submitQuiz();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [quizState, submitQuiz, questions]);

    const handleAnswerSelect = (questionId: number, option: string) => {
        setUserAnswers(prev => ({ ...prev, [questionId]: option }));
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            submitQuiz();
        }
    };

    if (quizState === 'loading') {
        return <div className="text-center p-8"><Loader2 className="animate-spin inline-block h-8 w-8" /> <p className="mt-2">Loading Exam...</p></div>;
    }

    if (error) {
        return (
            <div className="text-center text-slate-500 p-8">
                {error} 
                <Link href="/certificates" className="underline font-bold ml-2">
                    Go back
                </Link>
            </div>
        );
    }

    if (quizState === 'passed') {
        return (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-white dark:bg-neutral-800/50 rounded-lg">
                <CheckCircle className="h-16 w-16 text-emerald-600 mb-4" />
                <h2 className="text-2xl font-bold">Exam Passed!</h2>
                <p className="text-lg mt-2">Finalizing your certificate, please wait...</p>
                <Loader2 className="animate-spin inline-block h-8 w-8 mt-4" />
            </div>
        );
    }
    
    if (quizState === 'failed' && results) {
         return (
            <div className="bg-white dark:bg-neutral-800/50 p-8 rounded-2xl shadow-lg border text-center">
               <XCircle className="h-16 w-16 text-slate-500 mx-auto mb-4" />
               <h2 className="text-3xl font-bold text-center mb-4">
                    Exam Complete
                </h2>
                <p className="text-5xl font-bold text-center mb-6 text-slate-500">
                    {results.score.toFixed(1)}%
                </p>
                <p className="text-center text-lg text-neutral-600 dark:text-neutral-300">Unfortunately, you did not pass this time. Please review the materials and try again.</p>
                 <div className="text-center mt-8">
                    <Button onClick={() => router.push('/certificates')}>Back to Certificates</Button>
                </div>
            </div>
        );
    }
    
    if (quizState === 'active' || quizState === 'submitting') {
        const currentQuestion = questions[currentQuestionIndex];
        if (!currentQuestion) return <div className="text-center p-8"><Loader2 className="animate-spin inline-block h-8 w-8" /></div>;
        return (
             <div className="bg-white dark:bg-neutral-800/50 p-8 rounded-2xl shadow-lg border">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">{levelTitleMap[level]}</h2>
                    <div className="flex items-center text-lg font-semibold bg-slate-500/10 text-slate-500 px-3 py-1 rounded-full">
                        <Timer className="mr-2 h-5 w-5" /> {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                    </div>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2.5 mb-6">
                   <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
                </div>
                <h3 className="text-xl font-semibold mb-6">Question {currentQuestionIndex + 1}: {currentQuestion.question}</h3>
                <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => (
                        <button
                            key={index}
                            onClick={() => handleAnswerSelect(currentQuestion.id, option)}
                            className={`block w-full text-left p-4 rounded-lg border-2 transition ${userAnswers[currentQuestion.id] === option ? 'border-indigo-500 bg-indigo-500/10' : 'border-neutral-300 dark:border-neutral-600 hover:bg-neutral-100 dark:hover:bg-neutral-700'}`}
                        >
                            {option}
                        </button>
                    ))}
                </div>
                <div className="mt-8 flex justify-end">
                    <Button onClick={handleNext} disabled={!userAnswers[currentQuestion.id] || quizState === 'submitting'} size="lg">
                        {quizState === 'submitting' ? <Loader2 className="animate-spin" /> : currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Submit Exam'}
                    </Button>
                </div>
            </div>
        );
    }

    return null;
}