'use client';

import { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, CheckCircle, XCircle, History, FileText, Award, Eye, User as UserIcon, ShoppingCart, Brain, Plus, DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
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

interface SellerData {
  totalRevenue: number;
  totalSales: number;
  hasActiveListings: boolean;
  recentSales: Array<{
    prompt_id: number;
    purchase_price: number;
    purchased_at: string;
    saved_prompts: { title: string };
  }>;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [sellerData, setSellerData] = useState<SellerData | null>(null);
  const [sellerLoading, setSellerLoading] = useState(true);
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
          setSellerLoading(false);
          return;
        }
        setUser(user);
        
        // Fetch dashboard data
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

        // Fetch seller data if user has smart prompts
        try {
          const sellerRes = await fetch('/api/smart-prompts/my-prompts');
          if (sellerRes.ok) {
            const smartPromptsData = await sellerRes.json();
            
            // Check if user is a seller (has created prompts or sales)
            if (smartPromptsData.salesStats && (smartPromptsData.salesStats.totalSales > 0 || smartPromptsData.created?.length > 0)) {
              setSellerData({
                totalRevenue: smartPromptsData.salesStats.totalRevenue || 0,
                totalSales: smartPromptsData.salesStats.totalSales || 0,
                hasActiveListings: smartPromptsData.created?.some((p: any) => p.is_marketplace) || false,
                recentSales: smartPromptsData.salesStats.recentSales || []
              });
            }
          }
        } catch (sellerError) {
          console.error('Seller data fetch error:', sellerError);
          // Don't show error toast for seller data, just don't show the section
        }
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        toast.error('Network error loading dashboard. Please check your connection.');
      } finally {
        setLoading(false);
        setSellerLoading(false);
      }
    };

    fetchData();
  }, [supabase.auth]);

  const getProfileCompletion = () => {
    if (!profile) return 0;
    const fields = ['first_name', 'last_name', 'region', 'gender', 'age', 'education'];
    const completed = fields.filter(field => profile[field as keyof Profile]).length;
    return Math.round((completed / fields.length) * 100);
  };

  if (loading) return <LoadingSpinner />;
  if (!data || !profile) {
    return (
      <div className="p-8 text-center">
        <p className="text-lg text-neutral-600 dark:text-neutral-400">No data available. Please refresh the page.</p>
      </div>
    );
  }

  const profileCompletion = getProfileCompletion();

  return (
    <PageErrorBoundary>
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {profile?.first_name || 'User'}!
            </h1>
            <p className="text-indigo-100">
              Manage your prompts, track your progress, and explore new AI possibilities.
            </p>
          </div>
          <Suspense fallback={<LoadingSpinner size="sm" />}>
            <ComponentErrorBoundary componentName="UserIdentityBadge">
              <UserIdentityBadge user={user} size="lg" showTierName />
            </ComponentErrorBoundary>
          </Suspense>
        </div>
      </section>

      {/* Profile Completion Alert */}
      {profileCompletion < 100 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-800 dark:text-yellow-200 font-semibold">
                Complete your profile to unlock all features
              </p>
              <p className="text-yellow-600 dark:text-yellow-400 text-sm">
                Your profile is {profileCompletion}% complete
              </p>
            </div>
            <Link href="/profile">
              <Button variant="outline" size="sm" className="border-yellow-600 text-yellow-700 hover:bg-yellow-100">
                Complete Profile
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-lg shadow-md border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Saved Prompts</p>
              <p className="text-2xl font-bold dark:text-white">{data.prompts.length}</p>
            </div>
            <FileText className="text-indigo-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-lg shadow-md border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Quiz Attempts</p>
              <p className="text-2xl font-bold dark:text-white">{data.attempts.length}</p>
            </div>
            <History className="text-purple-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-lg shadow-md border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Certificates</p>
              <p className="text-2xl font-bold dark:text-white">{data.certificates.length}</p>
            </div>
            <Award className="text-green-500" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-lg shadow-md border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Pass Rate</p>
              <p className="text-2xl font-bold dark:text-white">
                {data.attempts.length > 0 
                  ? `${Math.round((data.attempts.filter(a => a.passed).length / data.attempts.length) * 100)}%`
                  : 'N/A'
                }
              </p>
            </div>
            <CheckCircle className="text-emerald-500" />
          </div>
        </div>
      </section>

      {/* Seller Dashboard Section - Only shown for users who sell prompts */}
      {sellerData && sellerData.hasActiveListings && (
        <section id="seller-earnings">
          <h2 className="text-2xl font-semibold mb-4 flex items-center dark:text-white">
            <DollarSign className="mr-2 text-green-500" /> Seller Earnings
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Earnings Card */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-8 rounded-lg shadow-md border border-green-200 dark:border-green-700">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-green-800 dark:text-green-200">Total Earnings</h3>
                <DollarSign className="w-10 h-10 text-green-500" />
              </div>
              {sellerLoading ? (
                <div className="flex items-center">
                  <Loader2 className="h-8 w-8 animate-spin text-green-500 mr-3" />
                  <span className="text-green-700 dark:text-green-300 text-lg">Loading...</span>
                </div>
              ) : (
                <>
                  <div className="text-4xl font-bold text-green-900 dark:text-green-100 mb-2">
                    ${(sellerData.totalRevenue || 0).toFixed(2)}
                  </div>
                  <p className="text-green-600 dark:text-green-400 mb-4">
                    From {sellerData.totalSales || 0} sales
                  </p>
                </>
              )}
            </div>

            {/* Recent Sales */}
            <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-lg shadow-md border border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
                Recent Sales
              </h3>
              {sellerData.recentSales.length > 0 ? (
                <div className="space-y-3">
                  {sellerData.recentSales.slice(0, 3).map((sale, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium dark:text-white">{sale.saved_prompts.title}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {new Date(sale.purchased_at).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                        ${sale.purchase_price.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <ShoppingCart className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">No sales yet</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section>
        <h2 className="text-2xl font-semibold mb-4 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/smart-prompts">
            <Button variant="outline" className="w-full h-16 text-left flex items-center justify-between">
              <div>
                <div className="font-semibold">Browse Smart Prompts</div>
                <div className="text-sm opacity-75">Discover marketplace prompts</div>
              </div>
              <Brain className="w-6 h-6" />
            </Button>
          </Link>
          
          <Link href="/certificates">
            <Button variant="outline" className="w-full h-16 text-left flex items-center justify-between">
              <div>
                <div className="font-semibold">Take Certification</div>
                <div className="text-sm opacity-75">Enhance your skills</div>
              </div>
              <Award className="w-6 h-6" />
            </Button>
          </Link>
          
          <Link href="/templates">
            <Button variant="outline" className="w-full h-16 text-left flex items-center justify-between">
              <div>
                <div className="font-semibold">Explore Templates</div>
                <div className="text-sm opacity-75">Free prompt templates</div>
              </div>
              <FileText className="w-6 h-6" />
            </Button>
          </Link>
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