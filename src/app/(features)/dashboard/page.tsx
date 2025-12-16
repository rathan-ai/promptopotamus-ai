'use client';

import { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { CheckCircle, History, FileText, Award, Brain } from 'lucide-react';
import { LoadingSkeleton } from '@/components/ui/Loading';
import { PageErrorBoundary, ComponentErrorBoundary } from '@/components/ui/ErrorBoundary';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

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