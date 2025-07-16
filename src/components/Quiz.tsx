'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './ui/Button';
import { Loader2, Timer, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link'; // Import the Link component

interface Question {
  id: number;
  question: string;
  options: string[];
}
// ... other interfaces remain the same

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
    const [results, setResults] = useState<{ passed: boolean; score: number; results: any[]; credentialId?: string } | null>(null);
    const router = useRouter();

    useEffect(() => {
        const startQuiz = async () => {
            const res = await fetch(`/api/quiz/start/${level}`);
            if (!res.ok) {
                const data = await res.json();
                setError(data.error || 'Failed to start the exam. You may not be eligible.');
                setQuizState('loading');
                return;
            }
            const data = await res.json();
            setQuestions(data.questions);
            setTimeLeft(data.timeLimit);
            setQuizState('active');
        };
        startQuiz();
    }, [level]);

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
                router.push(`/certificates/view/${resultData.credentialId}`);
            }, 2500);
        } else {
            setQuizState('failed');
        }

    }, [level, userAnswers, questions, quizState, router]);
    
    // ... other functions (useEffect for timer, handleAnswerSelect, handleNext) remain the same

    if (error) {
        return (
            <div className="text-center text-red-500 p-8">
                {error} 
                {/* Corrected Link component below */}
                <Link href="/certificates" className="underline font-bold ml-2">
                    Go back
                </Link>
            </div>
        );
    }
    
    // ... all other rendering logic (loading, passed, failed, active) remains the same
}