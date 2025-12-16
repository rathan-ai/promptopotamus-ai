'use client';

import { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { CheckCircle, History, FileText, Award, Brain, TrendingUp, Target } from 'lucide-react';
import { LoadingSkeleton } from '@/components/ui/Loading';
import { PageErrorBoundary, ComponentErrorBoundary } from '@/components/ui/ErrorBoundary';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import CertificationProgress from '@/components/features/dashboard/CertificationProgress';

// Lazy load heavy components that are not immediately visible
const UserSmartPromptsManager = dynamic(() => import('@/components/features/prompts/UserSmartPromptsManager'), {
  loading: () => <LoadingSkeleton lines={6} />,
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
  const supabase = createClient();

  useEffect(() => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const fetchData = async () => {
      try {
        // Get current user
        const { data: { user: authUser }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error('Auth error:', userError);
          toast.error('Authentication error. Please refresh the page.');
          setLoading(false);
          return;
        }

        if (!authUser) {
          console.log('No authenticated user found');
          setLoading(false);
          return;
        }

        // Fetch dashboard data
        const res = await fetch('/api/profiles/dashboard', {
          signal: controller.signal
        });

        if (res.ok) {
          const response = await res.json();
          // Handle new API response format
          const dashboardData = response.success ? response.data : response;
          setData(dashboardData);
          setProfile(dashboardData.profile);
        } else {
          const errorData = await res.json().catch(() => ({ error: 'Unknown error' }));
          console.error('Dashboard API error:', res.status, errorData);
          toast.error(errorData.error || 'Could not load your dashboard data.');
        }

        // Note: Seller data is now fetched by UserSmartPromptsManager component
        // to avoid duplicate API calls
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.error('Dashboard request timed out');
          toast.error('Request timed out. Please refresh the page.');
        } else {
          console.error('Dashboard fetch error:', error);
          toast.error('Network error loading dashboard. Please check your connection.');
        }
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    fetchData();

    return () => {
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [supabase.auth]);

  const getProfileCompletion = () => {
    if (!profile) return 0;
    const fields = ['first_name', 'last_name', 'region', 'gender', 'age', 'education'];
    const completed = fields.filter(field => profile[field as keyof Profile]).length;
    return Math.round((completed / fields.length) * 100);
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="spinner"></div>
    </div>
  );
  
  if (!data || !profile) {
    return (
      <div className="card">
        <div className="card-content text-center">
          <p>No data available. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  const profileCompletion = getProfileCompletion();

  return (
    <PageErrorBoundary>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="card">
          <div className="card-content">
            <h2 className="card-title">Welcome back, {profile?.first_name || 'User'}!</h2>
            <p className="card-description">
              Manage your prompts, track your progress, and explore new AI possibilities.
            </p>
          </div>
        </div>

      {/* Profile Completion Alert */}
      {profileCompletion < 100 && (
        <div className="card">
          <div className="card-content">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold">
                  Complete your profile to unlock all features
                </p>
                <p className="card-description">
                  Your profile is {profileCompletion}% complete
                </p>
              </div>
              <Link href="/profile">
                <button className="btn btn-outline">Complete Profile</button>
              </Link>
            </div>
          </div>
        </div>
      )}

        {/* Quick Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <FileText className="w-6 h-6" />
            </div>
            <div className="stat-value">{data.prompts.length}</div>
            <div className="stat-label">Saved Prompts</div>
          </div>
        
          <div className="stat-card">
            <div className="stat-icon">
              <History className="w-6 h-6" />
            </div>
            <div className="stat-value">{data.attempts.length}</div>
            <div className="stat-label">Quiz Attempts</div>
          </div>
        
          <div className="stat-card">
            <div className="stat-icon">
              <Award className="w-6 h-6" />
            </div>
            <div className="stat-value">{data.certificates.length}</div>
            <div className="stat-label">Certificates</div>
          </div>
        
          <div className="stat-card">
            <div className="stat-icon">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div className="stat-value">
              {data.attempts.length > 0 
                ? `${Math.round((data.attempts.filter(a => a.passed).length / data.attempts.length) * 100)}%`
                : 'N/A'
              }
            </div>
            <div className="stat-label">Pass Rate</div>
          </div>
        </div>

      {/* Seller earnings info is now in the Smart Prompts Management section below */}

        {/* Certification Progress - Visual Journey */}
        <CertificationProgress certificates={data.certificates} />

        {/* Next Achievement Preview */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              Next Milestone
            </h3>
          </div>
          <div className="card-content">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Prompts Milestone */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Prompts Created</span>
                  <FileText className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{data.prompts.length}/10</div>
                <div className="h-2 bg-blue-200 dark:bg-blue-800 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((data.prompts.length / 10) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                  {data.prompts.length >= 10
                    ? "Prompt Creator badge unlocked!"
                    : `${10 - data.prompts.length} more to unlock "Prompt Creator" badge`
                  }
                </p>
              </div>

              {/* Quiz Milestone */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Quizzes Passed</span>
                  <CheckCircle className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
                  {data.attempts.filter(a => a.passed).length}/5
                </div>
                <div className="h-2 bg-emerald-200 dark:bg-emerald-800 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((data.attempts.filter(a => a.passed).length / 5) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
                  {data.attempts.filter(a => a.passed).length >= 5
                    ? "Quiz Master badge unlocked!"
                    : `${5 - data.attempts.filter(a => a.passed).length} more to unlock "Quiz Master" badge`
                  }
                </p>
              </div>

              {/* Activity Streak */}
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Activity Streak</span>
                  <TrendingUp className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold text-amber-900 dark:text-amber-100">
                  {data.certificates.length > 0 ? '🔥' : '0'} days
                </div>
                <div className="h-2 bg-amber-200 dark:bg-amber-800 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: data.certificates.length > 0 ? '20%' : '0%' }}
                  />
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                  Keep learning daily to build your streak!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card-grid">
          <Link href="/smart-prompts" className="block">
            <div className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="card-content">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Browse Smart Prompts</div>
                    <div className="card-description">Discover marketplace prompts</div>
                  </div>
                  <Brain className="w-8 h-8 text-blue-500" />
                </div>
              </div>
            </div>
          </Link>

          <Link href="/certificates" className="block">
            <div className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="card-content">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Take Certification</div>
                    <div className="card-description">Enhance your skills</div>
                  </div>
                  <Award className="w-8 h-8 text-emerald-600" />
                </div>
              </div>
            </div>
          </Link>

          <Link href="/resources" className="block">
            <div className="card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="card-content">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">Explore Templates</div>
                    <div className="card-description">Free prompt templates</div>
                  </div>
                  <FileText className="w-8 h-8 text-slate-500" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Smart Prompts Management Section */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title flex items-center">
              <Brain className="w-5 h-5 mr-2" /> Smart Prompts Management
            </h2>
          </div>
          <div className="card-content">
            <Suspense fallback={<div className="spinner mx-auto"></div>}>
              <ComponentErrorBoundary componentName="UserSmartPromptsManager">
                <UserSmartPromptsManager certificates={data?.certificates} />
              </ComponentErrorBoundary>
            </Suspense>
          </div>
        </div>
      </div>
    </PageErrorBoundary>
  );
}