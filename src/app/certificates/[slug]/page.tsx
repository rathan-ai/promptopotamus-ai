'use client';

import { certificates, Certificate } from '@/lib/data';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { AlertCircle, CheckCircle, Clock, Loader2, CreditCard, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

type QuizStatus = {
    canTakeQuiz: boolean;
    reason: string | null;
    cooldownUntil?: string;
    attemptsMade?: number;
    totalAllowed?: number;
    needsPayment?: boolean;
    attemptType?: 'free' | 'purchased';
    purchaseCount?: number;
};

const quizLevelMap: Record<string, 'beginner' | 'intermediate' | 'master'> = { 
    'promptling': 'beginner', 
    'promptosaur': 'intermediate', 
    'promptopotamus': 'master' 
};

export default function CertificateDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const router = useRouter();
    const supabase = createClient();
    const [status, setStatus] = useState<QuizStatus | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [slug, setSlug] = useState<string | null>(null);
    const [cert, setCert] = useState<Certificate | null>(null);

    const checkStatus = useCallback(async () => {
        if (!slug) return;
        setIsLoading(true);
        const level = quizLevelMap[slug];
        if (!level) {
            setIsLoading(false);
            return;
        }
        
        const res = await fetch(`/api/quiz/status/${level}`);
        if (!res.ok) {
            toast.error('Could not fetch exam status.');
            setIsLoading(false);
            return;
        }
        const data = await res.json();
        setStatus(data);
        setIsLoading(false);
    }, [slug]);

    useEffect(() => {
        const loadParams = async () => {
            const resolvedParams = await params;
            setSlug(resolvedParams.slug);
            setCert(certificates[resolvedParams.slug]);
        };
        loadParams();
    }, [params]);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
            if (user) {
                checkStatus();
            } else {
                setIsLoading(false);
            }
        };
        if (slug) {
            checkUser();
        }
    }, [slug, supabase.auth, checkStatus]);

    if (!cert || !slug) return <div className="p-4 text-center">Loading...</div>;
    const quizLevel = quizLevelMap[slug];

    const handlePurchase = async () => {
        setIsLoading(true);
        toast.loading('Simulating payment...');
        const res = await fetch('/api/purchase-attempts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ level: quizLevel }),
        });
        const data = await res.json();
        toast.dismiss();
        if (res.ok) {
            toast.success(data.message);
            checkStatus();
        } else {
            toast.error(data.error);
            setIsLoading(false);
        }
    };

    const renderStatus = () => {
        if (isLoading) {
            return <div className="flex items-center justify-center p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg"><Loader2 className="mr-2 animate-spin" /> Checking your status...</div>
        }
        if (!user) {
             return (
                <div className="p-4 bg-slate-500/10 text-slate-500 rounded-lg text-center">
                    <AlertCircle className="inline-block mr-2" />
                    Please <Link href="/login" className="font-bold underline">log in</Link> to take the exam.
                </div>
            )
        }
        if (!status) return null;

        if (status.canTakeQuiz) {
            const attemptTypeText = status.attemptType === 'free' 
                ? 'You are on your initial free attempts.' 
                : `This is a purchased attempt block.`;
            
            return (
                 <div className="text-center p-4 bg-emerald-600/10 text-emerald-600 rounded-lg">
                    <CheckCircle className="inline-block mr-2" />
                    You are ready! {attemptTypeText} You have { (status.totalAllowed || 0) - (status.attemptsMade || 0) } of {status.totalAllowed} attempts remaining.
                </div>
            );
        } else {
            return (
                <div className="text-center p-4 bg-slate-500/10 text-slate-500 rounded-lg">
                    <Clock className="inline-block mr-2" />
                    {status.reason}
                    {status.cooldownUntil && ` You can try again for free on ${new Date(status.cooldownUntil).toLocaleDateString()}.`}
                </div>
            )
        }
    }

    const renderButtons = () => {
        if (!user || isLoading) {
            return <Button size="lg" className="w-full" disabled>Loading...</Button>
        }
        if (status?.canTakeQuiz) {
            return (
                <Button size="lg" className="w-full" onClick={() => router.push(`/quiz/${quizLevel}`)}>
                    Take the {cert.level} Exam
                </Button>
            );
        }
        if (status?.needsPayment) {
            const purchaseCount = status.purchaseCount || 0;
            const buttonText = purchaseCount > 0 
                ? `Purchase Again (Unlock Attempts ${purchaseCount*3 + 4}-${purchaseCount*3 + 6})`
                : 'Purchase 3 More Attempts';

            return (
                <Button onClick={handlePurchase} disabled={isLoading} size="lg" className="w-full">
                    <CreditCard className="mr-2 h-4 w-4" /> {buttonText}
                </Button>
            );
        }
        return <Button size="lg" className="w-full" disabled>Unavailable at this time</Button>;
    }

    return (
        <div className="max-w-4xl mx-auto">
            <Link href="/certificates" className="inline-flex items-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mb-6">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Exams
            </Link>
            <div className="bg-white dark:bg-neutral-800/50 p-8 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700">
                <h1 className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">{cert.badgeName}</h1>
                <p className="mt-4 text-lg text-neutral-700 dark:text-neutral-300">{cert.description}</p>
                
                <h2 className="text-2xl font-semibold mt-8 mb-4 dark:text-white">Criteria</h2>
                <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
                    {cert.criteria.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
                
                <h2 className="text-2xl font-semibold mt-8 mb-4 dark:text-white">Skills Covered</h2>
                <div className="flex flex-wrap gap-2">
                    {cert.skills.map(skill => <span key={skill} className="bg-neutral-200 dark:bg-neutral-700 text-sm font-medium px-3 py-1 rounded-full">{skill}</span>)}
                </div>

                <div className="mt-12 space-y-4">
                   {renderStatus()}
                   {renderButtons()}
                </div>
            </div>
        </div>
    );
}