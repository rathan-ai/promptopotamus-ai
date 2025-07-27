'use client';

import { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, CheckCircle, XCircle, History, FileText, Award, Eye, User as UserIcon, ShoppingCart, Brain, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner, LoadingSkeleton } from '@/components/ui/Loading';
import { PageErrorBoundary, ComponentErrorBoundary } from '@/components/ui/ErrorBoundary';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { certificates as certDetails } from '@/lib/data';
import { createClient } from '@/lib/supabase/client';

// Lazy load heavy components that are not immediately visible
const UserSmartPromptsManager = dynamic(() => import('@/components/features/prompts/UserSmartPromptsManager'), {
  loading: () => <LoadingSkeleton lines={6} />,
  ssr: false
});

const UserIdentityBadge = dynamic(() => import('@/components/features/profiles/UserIdentityBadge'), {
  loading: () => <LoadingSpinner size="sm" />,
  ssr: false
});

// Define interfaces for our data
interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  region: string;
  gender: string;
  age: number;
  education: string;
  purchased_attempts: Record<string, number>;
}
interface QuizAttempt { id: number; quiz_level: string; attempted_at: string; score: number; passed: boolean; }
interface SavedPrompt { id: number; title: string; prompt_text: string; created_at: string; }
interface UserCertificate { id: number; certificate_slug: string; earned_at: string; credential_id: string; }

interface DashboardData {
  attempts: QuizAttempt[];
  prompts: SavedPrompt[];
  certificates: UserCertificate[];
  profile: Profile;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error('Auth error:', userError);
          toast.error('Authentication error. Please refresh the page.');
          setLoading(false);
          return;
        }
        setUser(user);
        
        const res = await fetch('/api/profiles/dashboard');
        if (res.ok) {
          const response = await res.json();
          // Handle new API response format
          const dashboardData = response.success ? response.data : response;
          setData(dashboardData);
          setProfile(dashboardData.profile);
        } else {
          const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
          toast.error(errorData.error || 'Could not load your dashboard data.');
        }
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        toast.error('Network error loading dashboard. Please check your connection.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [supabase.auth]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
    });
    const result = await res.json();
    if(res.ok) {
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
  
  const passedAttempts = data?.attempts.filter(a => a.passed) || [];
  const failedAttempts = data?.attempts.filter(a => !a.passed) || [];
  const purchaseHistory = data?.profile.purchased_attempts ? Object.entries(data.profile.purchased_attempts) : [];

  return (
    <PageErrorBoundary>
      <div className="max-w-5xl mx-auto space-y-12">
      <div className="flex items-center gap-4">
        <h1 className="text-4xl font-bold dark:text-white">Your Dashboard</h1>
        {user && (
          <Suspense fallback={<LoadingSpinner size="sm" />}>
            <UserIdentityBadge user={user} size="lg" />
          </Suspense>
        )}
      </div>

      {/* Profile Settings Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center dark:text-white"><UserIcon className="mr-2" /> Profile Settings</h2>
        <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-lg shadow-md border border-neutral-200 dark:border-neutral-700">
            <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div>
                    <label htmlFor="first_name" className="block text-sm font-medium">First Name</label>
                    <input type="text" name="first_name" id="first_name" value={profile?.first_name || ''} onChange={handleProfileInputChange} className="mt-1 block w-full rounded-md dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 shadow-sm px-3 py-2" />
                </div>
                {/* Last Name */}
                <div>
                    <label htmlFor="last_name" className="block text-sm font-medium">Last Name</label>
                    <input type="text" name="last_name" id="last_name" value={profile?.last_name || ''} onChange={handleProfileInputChange} className="mt-1 block w-full rounded-md dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 shadow-sm px-3 py-2" />
                </div>
                {/* Age */}
                <div>
                    <label htmlFor="age" className="block text-sm font-medium">Age</label>
                    <input type="number" name="age" id="age" value={profile?.age || ''} onChange={handleProfileInputChange} className="mt-1 block w-full rounded-md dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 shadow-sm px-3 py-2" />
                </div>
                {/* Gender */}
                <div>
                    <label htmlFor="gender" className="block text-sm font-medium">Gender</label>
                    <select name="gender" id="gender" value={profile?.gender || ''} onChange={handleProfileInputChange} className="mt-1 block w-full rounded-md dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 shadow-sm px-3 py-2">
                        <option value="">Select...</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                </div>
                {/* Region */}
                <div className="md:col-span-2">
                    <label htmlFor="region" className="block text-sm font-medium">Country / Region</label>
                    <input type="text" name="region" id="region" value={profile?.region || ''} onChange={handleProfileInputChange} className="mt-1 block w-full rounded-md dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 shadow-sm px-3 py-2" placeholder="e.g., United States" />
                </div>
                {/* Education */}
                <div className="md:col-span-2">
                    <label htmlFor="education" className="block text-sm font-medium">Highest Educational Qualification</label>
                    <input type="text" name="education" id="education" value={profile?.education || ''} onChange={handleProfileInputChange} className="mt-1 block w-full rounded-md dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 shadow-sm px-3 py-2" placeholder="e.g., Bachelor's Degree in Computer Science" />
                </div>
                {/* Save Button */}
                <div className="md:col-span-2 text-right">
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
      </section>

      {/* My Certificates Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center dark:text-white"><Award className="mr-2" /> My Certificates</h2>
        <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-lg shadow-md border border-neutral-200 dark:border-neutral-700">
          {data?.certificates && data.certificates.length > 0 ? (
            <ul className="space-y-4">
              {data.certificates.map((cert) => (
                <li key={cert.id} className="flex items-center justify-between p-3 bg-neutral-100 dark:bg-neutral-800 rounded-md">
                  <div>
                    <p className="font-semibold">{certDetails[cert.certificate_slug]?.badgeName || 'Certificate'}</p>
                    <p className="text-sm text-neutral-500">Earned on: {new Date(cert.earned_at).toLocaleDateString()}</p>
                  </div>
                  <Link href={`/certificates/view/${cert.credential_id}`} passHref>
                    <Button asChild size="sm" variant="outline">
                      <a><Eye className="mr-2 h-4 w-4" /> View</a>
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          ) : ( <p className="text-neutral-500">You haven&apos;t earned any certificates yet.</p> )}
        </div>
      </section>

      {/* Exam History Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center dark:text-white"><History className="mr-2" /> Exam History</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-neutral-800/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center text-green-600"><CheckCircle className="mr-2" /> Passed Exams</h3>
                {passedAttempts.length > 0 ? (
                    <ul className="space-y-2">{passedAttempts.map(a => <li key={a.id} className="text-sm p-2 bg-neutral-100 dark:bg-neutral-800 rounded capitalize">{a.quiz_level} Exam ({a.score.toFixed(0)}%)</li>)}</ul>
                ) : <p className="text-sm text-neutral-500">No passed exams yet.</p>}
            </div>
            <div className="bg-white dark:bg-neutral-800/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-3 flex items-center text-red-600"><XCircle className="mr-2" /> Failed Attempts</h3>
                {failedAttempts.length > 0 ? (
                    <ul className="space-y-2">{failedAttempts.map(a => <li key={a.id} className="text-sm p-2 bg-neutral-100 dark:bg-neutral-800 rounded capitalize">{a.quiz_level} Exam ({a.score.toFixed(0)}%)</li>)}</ul>
                ) : <p className="text-sm text-neutral-500">No failed attempts. Great job!</p>}
            </div>
        </div>
      </section>

      {/* Purchase History Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center dark:text-white"><ShoppingCart className="mr-2" /> Purchase History</h2>
        <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-lg shadow-md border border-neutral-200 dark:border-neutral-700">
          {purchaseHistory.length > 0 ? (
            <ul className="space-y-2">
              {purchaseHistory.map(([level, count]) => (
                <li key={level} className="text-sm p-2 bg-neutral-100 dark:bg-neutral-800 rounded capitalize">
                  {level}: {count} purchase(s) for {count * 3} extra attempts.
                </li>
              ))}
            </ul>
          ) : ( <p className="text-neutral-500">You have not purchased any extra attempts.</p> )}
        </div>
      </section>
      
      {/* Saved Prompts Section */}
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

      {/* Smart Prompts Management Section */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 flex items-center dark:text-white">
          <Brain className="mr-2" /> Smart Prompts Management
        </h2>
        <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-lg shadow-md border border-neutral-200 dark:border-neutral-700">
          <Suspense fallback={<LoadingSkeleton lines={6} />}>
            <ComponentErrorBoundary componentName="UserSmartPromptsManager">
              <UserSmartPromptsManager certificates={data?.certificates} />
            </ComponentErrorBoundary>
          </Suspense>
        </div>
      </section>
    </div>
    </PageErrorBoundary>
  );
}
