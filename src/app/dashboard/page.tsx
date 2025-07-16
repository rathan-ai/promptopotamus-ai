'use client';

import { useEffect, useState } from 'react';
import { Loader2, CheckCircle, XCircle, History, FileText, Award, Eye, User as UserIcon, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { certificates as certDetails } from '@/lib/data';

interface Profile { id: string; first_name: string; last_name: string; region: string; gender: string; age: number; education: string; purchased_attempts: Record<string, number>; }
interface QuizAttempt { id: number; quiz_level: string; attempted_at: string; score: number; passed: boolean; }
interface SavedPrompt { id: number; title: string; prompt_text: string; created_at: string; }
interface UserCertificate { id: number; certificate_slug: string; earned_at: string; credential_id: string; expires_at: string; }
interface DashboardData { attempts: QuizAttempt[]; prompts: SavedPrompt[]; certificates: UserCertificate[]; profile: Profile; }

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const res = await fetch('/api/dashboard');
    if (res.ok) {
      const dashboardData = await res.json();
      setData(dashboardData);
      setProfile(dashboardData.profile);
    } else {
      toast.error('Could not load your dashboard data.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await fetch('/api/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) });
    const result = await res.json();
    if (res.ok) {
      toast.success(result.message);
    } else {
      toast.error(result.error);
    }
    setIsSaving(false);
  };

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => prev ? { ...prev, [name]: value } : null);
  };

  const copyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Prompt copied to clipboard!');
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }
  
  const passedAttempts = data?.attempts?.filter(a => a.passed) || [];
  const failedAttempts = data?.attempts?.filter(a => !a.passed) || [];
  const purchaseHistory = data?.profile?.purchased_attempts ? Object.entries(data.profile.purchased_attempts) : [];

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <h1 className="text-4xl font-bold dark:text-white">Your Dashboard</h1>
      {/* Profile Settings and other sections */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center dark:text-white"><FileText className="mr-2" /> Saved Prompts</h2>
        <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-lg shadow-md border border-neutral-200 dark:border-neutral-700">
          {data?.prompts && data.prompts.length > 0 ? (
            <ul className="space-y-4">
              {data.prompts.map((prompt) => (
                <li key={prompt.id} className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-md">
                  <div className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold">{prompt.title || 'Untitled Prompt'}</p>
                        <p className="text-sm text-neutral-500 mt-2 whitespace-pre-wrap font-mono">{prompt.prompt_text}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => copyPrompt(prompt.prompt_text)}>Copy</Button>
                  </div>
                </li>
              ))}
            </ul>
          ) : ( <p className="text-neutral-500">You haven&apos;t saved any prompts yet. Use the Prompt Builder to create and save one!</p> )}
        </div>
      </section>
    </div>
  );
}