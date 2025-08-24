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

      {/* Seller Dashboard Section - Only shown for users who sell prompts */}
      {sellerData && sellerData.hasActiveListings && (
        <div className="mb-8">
          <h2 className="card-title mb-4 flex items-center">
            <DollarSign className="w-5 h-5 mr-2" /> Seller Earnings
          </h2>
          <div className="grid-container grid-2">
            {/* Earnings Card */}
            <div className="card">
              <div className="card-content">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="card-title">Total Earnings</h3>
                  <DollarSign className="w-8 h-8" />
                </div>
                {sellerLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-6 h-6 animate-spin mr-3" />
                    <span>Loading...</span>
                  </div>
                ) : (
                  <>
                    <div className="stat-value mb-2">
                      ${(sellerData.totalRevenue || 0).toFixed(2)}
                    </div>
                    <p className="card-description">
                      From {sellerData.totalSales || 0} sales
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Recent Sales */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Recent Sales
                </h3>
              </div>
              <div className="card-content">
                {sellerData.recentSales.length > 0 ? (
                  <div>
                    {sellerData.recentSales.slice(0, 3).map((sale, idx) => (
                      <div key={idx} className="flex justify-between items-center mb-4">
                        <div>
                          <p className="font-medium">{sale.saved_prompts.title}</p>
                          <p className="text-xs card-description">
                            {new Date(sale.purchased_at).toLocaleDateString()}
                          </p>
                        </div>
                        <p className="font-semibold">
                          ${sale.purchase_price.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <ShoppingCart className="w-8 h-8 mx-auto mb-2" />
                    <p className="card-description">No sales yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

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