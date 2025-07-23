'use client';

import { useEffect, useState } from 'react';
import { 
  Loader2, 
  Brain, 
  Edit3, 
  Trash2, 
  Eye, 
  DollarSign, 
  Download, 
  Star, 
  Calendar,
  TrendingUp,
  ShoppingBag,
  Plus,
  Settings,
  Globe,
  Lock,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface SmartPrompt {
  id: number;
  title: string;
  description: string;
  prompt_text: string;
  complexity_level: 'simple' | 'smart' | 'recipe';
  category: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  price: number;
  downloads_count: number;
  rating_average: number;
  rating_count: number;
  use_cases: string[];
  ai_model_compatibility: string[];
  is_marketplace: boolean;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  variables?: any;
  recipe_steps?: any;
  instructions?: string;
  example_inputs?: string[];
  example_outputs?: string[];
  purchase_info?: {
    purchase_price: number;
    purchased_at: string;
  };
}

interface SalesStats {
  totalSales: number;
  totalRevenue: number;
  recentSales: Array<{
    prompt_id: number;
    purchase_price: number;
    purchased_at: string;
    saved_prompts: { title: string };
  }>;
}

interface UserSmartPromptsData {
  created: SmartPrompt[];
  purchased: SmartPrompt[];
  salesStats: SalesStats;
  canCreateMarketplace: boolean;
  certificationStatus: {
    hasValidCertificate: boolean;
    certificates: any[];
  };
}

interface UserSmartPromptsManagerProps {
  certificates?: any[];
}

export default function UserSmartPromptsManager({ certificates }: UserSmartPromptsManagerProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<UserSmartPromptsData | null>(null);
  const [activeTab, setActiveTab] = useState<'created' | 'purchased' | 'analytics'>('created');
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/smart-prompts/my-prompts');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        toast.error('Failed to load Smart Prompts data');
      }
    } catch (error) {
      console.error('Error fetching Smart Prompts:', error);
      toast.error('Error loading Smart Prompts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (promptId: number) => {
    if (!confirm('Are you sure you want to delete this Smart Prompt? This action cannot be undone.')) {
      return;
    }

    setDeleteLoading(promptId);
    try {
      const response = await fetch('/api/smart-prompts/my-prompts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId }),
      });

      const result = await response.json();
      
      if (response.ok) {
        toast.success('Smart Prompt deleted successfully');
        fetchData(); // Refresh the data
      } else {
        toast.error(result.error || 'Failed to delete Smart Prompt');
      }
    } catch (error) {
      console.error('Error deleting Smart Prompt:', error);
      toast.error('Error deleting Smart Prompt');
    } finally {
      setDeleteLoading(null);
    }
  };

  const toggleMarketplaceStatus = async (promptId: number, currentStatus: boolean) => {
    try {
      const response = await fetch('/api/smart-prompts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id: promptId,
          is_marketplace: !currentStatus,
          is_public: !currentStatus
        }),
      });

      if (response.ok) {
        toast.success(`Smart Prompt ${!currentStatus ? 'published' : 'unpublished'} successfully`);
        fetchData();
      } else {
        const result = await response.json();
        toast.error(result.error || 'Failed to update marketplace status');
      }
    } catch (error) {
      console.error('Error updating marketplace status:', error);
      toast.error('Error updating marketplace status');
    }
  };

  const getComplexityBadge = (level: string) => {
    const badges = {
      simple: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      smart: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      recipe: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
    };
    return badges[level as keyof typeof badges] || badges.simple;
  };

  const getDifficultyBadge = (level: string) => {
    const badges = {
      beginner: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      intermediate: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
      advanced: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    };
    return badges[level as keyof typeof badges] || badges.beginner;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const hasValidCertificate = data?.certificationStatus.hasValidCertificate || false;

  return (
    <div className="space-y-6">
      {/* Header with Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-neutral-800/50 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center">
            <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Created</p>
              <p className="text-xl font-semibold">{data?.created.length || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-neutral-800/50 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center">
            <ShoppingBag className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Purchased</p>
              <p className="text-xl font-semibold">{data?.purchased.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800/50 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center">
            <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400 mr-2" />
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Sales</p>
              <p className="text-xl font-semibold">{data?.salesStats.totalSales || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-neutral-800/50 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center">
            <DollarSign className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
            <div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Revenue</p>
              <p className="text-xl font-semibold">${(data?.salesStats.totalRevenue || 0).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 flex-wrap">
        <Link href="/smart-prompts">
          <Button className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Create New Prompt
          </Button>
        </Link>
        <Link href="/smart-prompts">
          <Button variant="outline" className="flex items-center">
            <Brain className="w-4 h-4 mr-2" />
            Browse Marketplace
          </Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 dark:border-neutral-700">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'created', label: 'My Created Prompts', count: data?.created.length },
            { id: 'purchased', label: 'Purchased Prompts', count: data?.purchased.length },
            { id: 'analytics', label: 'Sales Analytics', count: data?.salesStats.totalSales }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'created' && (
          <div className="space-y-4">
            {!hasValidCertificate && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                <div className="flex items-center">
                  <Lock className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-2" />
                  <div>
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">Certification Required for Marketplace</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Get certified to publish your prompts in the marketplace and earn revenue!
                    </p>
                    <Link href="/certificates" className="inline-flex items-center mt-2">
                      <Button size="sm" variant="outline">
                        Get Certified
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
            
            {data?.created && data.created.length > 0 ? (
              <div className="grid gap-4">
                {data.created.map((prompt) => (
                  <div key={prompt.id} className="bg-white dark:bg-neutral-800/50 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold dark:text-white">{prompt.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityBadge(prompt.complexity_level)}`}>
                            {prompt.complexity_level}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyBadge(prompt.difficulty_level)}`}>
                            {prompt.difficulty_level}
                          </span>
                          {prompt.is_marketplace ? (
                            <span className="px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 rounded-full text-xs font-medium flex items-center">
                              <Globe className="w-3 h-3 mr-1" />
                              Published
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400 rounded-full text-xs font-medium flex items-center">
                              <Lock className="w-3 h-3 mr-1" />
                              Private
                            </span>
                          )}
                        </div>
                        
                        <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-3">{prompt.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                          {prompt.price > 0 && (
                            <span className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-1" />
                              ${prompt.price}
                            </span>
                          )}
                          <span className="flex items-center">
                            <Download className="w-4 h-4 mr-1" />
                            {prompt.downloads_count} downloads
                          </span>
                          {prompt.rating_count > 0 && (
                            <span className="flex items-center">
                              <Star className="w-4 h-4 mr-1" />
                              {prompt.rating_average.toFixed(1)} ({prompt.rating_count})
                            </span>
                          )}
                          <span className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(prompt.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <Link href={`/smart-prompts/${prompt.id}`}>
                          <Button size="sm" variant="ghost">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toast.info('Edit functionality coming soon!')}
                        >
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        {hasValidCertificate && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleMarketplaceStatus(prompt.id, prompt.is_marketplace)}
                          >
                            {prompt.is_marketplace ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(prompt.id)}
                          disabled={deleteLoading === prompt.id}
                        >
                          {deleteLoading === prompt.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Brain className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold dark:text-white mb-2">No Smart Prompts Yet</h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  Create your first Smart Prompt to get started with intelligent templates and recipes.
                </p>
                <Link href="/smart-prompts">
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Prompt
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'purchased' && (
          <div className="space-y-4">
            {data?.purchased && data.purchased.length > 0 ? (
              <div className="grid gap-4">
                {data.purchased.map((prompt) => (
                  <div key={prompt.id} className="bg-white dark:bg-neutral-800/50 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold dark:text-white">{prompt.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityBadge(prompt.complexity_level)}`}>
                            {prompt.complexity_level}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyBadge(prompt.difficulty_level)}`}>
                            {prompt.difficulty_level}
                          </span>
                        </div>
                        
                        <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-3">{prompt.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-neutral-500 dark:text-neutral-400">
                          {prompt.purchase_info && (
                            <>
                              <span className="flex items-center">
                                <DollarSign className="w-4 h-4 mr-1" />
                                Paid ${prompt.purchase_info.purchase_price}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                Purchased {new Date(prompt.purchase_info.purchased_at).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-4">
                        <div className="flex gap-2">
                          <Link href={`/smart-prompts/${prompt.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              Use Prompt
                            </Button>
                          </Link>
                          <Link href={`/smart-prompts/${prompt.id}?tab=reviews`}>
                            <Button size="sm" variant="ghost">
                              <Star className="w-4 h-4 mr-1" />
                              Review
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingBag className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold dark:text-white mb-2">No Purchased Prompts</h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  Browse the marketplace to find and purchase Smart Prompts created by other users.
                </p>
                <Link href="/smart-prompts">
                  <Button variant="outline">
                    <Brain className="w-4 h-4 mr-2" />
                    Browse Marketplace
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {hasValidCertificate ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Sales</p>
                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {data?.salesStats.totalSales || 0}
                        </p>
                      </div>
                      <TrendingUp className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Revenue</p>
                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          ${(data?.salesStats.totalRevenue || 0).toFixed(2)}
                        </p>
                      </div>
                      <DollarSign className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  
                  <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Total Reviews</p>
                        <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          {data?.created.reduce((sum, p) => sum + p.rating_count, 0) || 0}
                        </p>
                      </div>
                      <Star className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </div>

                {data?.salesStats.recentSales && data.salesStats.recentSales.length > 0 && (
                  <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700">
                    <h3 className="text-lg font-semibold dark:text-white mb-4">Recent Sales</h3>
                    <div className="space-y-3">
                      {data.salesStats.recentSales.map((sale, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                          <div>
                            <p className="font-medium dark:text-white">{sale.saved_prompts.title}</p>
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                              {new Date(sale.purchased_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600 dark:text-green-400">
                              +${sale.purchase_price}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold dark:text-white mb-2">Analytics Unavailable</h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                  Get certified to access sales analytics and start earning from your Smart Prompts.
                </p>
                <Link href="/certificates">
                  <Button>
                    Get Certified
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}