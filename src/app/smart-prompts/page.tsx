'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Grid, List, Star, Download, DollarSign, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import SmartPromptsBuilder from '@/components/SmartPromptsBuilder';
import PromptPreviewModal from '@/components/PromptPreviewModal';
import StripePaymentModal from '@/components/StripePaymentModal';
import toast from 'react-hot-toast';

interface Variable {
  name: string;
  type: 'text' | 'select' | 'textarea' | 'number';
  description: string;
  required: boolean;
  options?: string[];
  defaultValue?: string;
}

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
  variables: Variable[];
  example_inputs: Record<string, string>;
  created_at: string;
  profiles?: { full_name: string };
}

interface UserCertificationStatus {
  hasValidCertificate: boolean;
  certificates: any[];
}

const categories = [
  'All Categories', 'Marketing & Sales', 'Content Writing', 'Code & Development', 
  'Data Analysis', 'Creative Writing', 'Business Strategy', 'Education & Training', 
  'Research', 'Customer Service', 'Social Media', 'Email Marketing', 'Other'
];

const complexityColors = {
  simple: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
  smart: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
  recipe: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200'
};

const difficultyColors = {
  beginner: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200',
  intermediate: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
  advanced: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
};

export default function SmartPromptsPage() {
  const [activeView, setActiveView] = useState<'marketplace' | 'builder'>('marketplace');
  const [prompts, setPrompts] = useState<SmartPrompt[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<SmartPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedComplexity, setSelectedComplexity] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [certificationStatus, setCertificationStatus] = useState<UserCertificationStatus>({
    hasValidCertificate: false,
    certificates: []
  });
  const [previewPrompt, setPreviewPrompt] = useState<SmartPrompt | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPromptForPurchase, setSelectedPromptForPurchase] = useState<SmartPrompt | null>(null);

  const fetchPrompts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'All Categories') params.set('category', selectedCategory);
      if (selectedComplexity !== 'all') params.set('complexity', selectedComplexity);
      if (selectedDifficulty !== 'all') params.set('difficulty', selectedDifficulty);
      if (priceRange !== 'all') params.set('priceRange', priceRange);

      const response = await fetch(`/api/smart-prompts?${params}`);
      if (response.ok) {
        const data = await response.json();
        setPrompts(data.prompts || []);
      } else {
        toast.error('Failed to load smart prompts');
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
      toast.error('Error loading prompts');
    } finally {
      setLoading(false);
    }
  };

  const checkCertificationStatus = async () => {
    try {
      const response = await fetch('/api/smart-prompts/my-prompts');
      if (response.ok) {
        const data = await response.json();
        setCertificationStatus({
          hasValidCertificate: data.canCreateMarketplace,
          certificates: data.certificationStatus.certificates
        });
      }
    } catch (error) {
      console.error('Error checking certification:', error);
    }
  };

  useEffect(() => {
    fetchPrompts();
    checkCertificationStatus();
  }, [selectedCategory, selectedComplexity, selectedDifficulty, priceRange]);

  useEffect(() => {
    let filtered = prompts.filter(prompt => {
      const matchesSearch = searchQuery === '' || 
        prompt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prompt.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesSearch;
    });

    // Sort prompts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating_average - a.rating_average;
        case 'downloads':
          return b.downloads_count - a.downloads_count;
        case 'price':
          return a.price - b.price;
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default:
          return 0;
      }
    });

    setFilteredPrompts(filtered);
  }, [prompts, searchQuery, sortBy]);

  const handlePurchase = async (promptId: number) => {
    try {
      const response = await fetch('/api/smart-prompts/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ promptId })
      });

      const data = await response.json();
      
      if (response.ok) {
        if (data.free) {
          toast.success('Free prompt added to your collection!');
          // Refresh the prompts to update download count
          fetchPrompts();
        } else {
          // Handle paid prompts with Stripe (to be implemented)
          toast.success('Redirecting to payment...');
          // TODO: Integrate Stripe payment flow
        }
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      console.error('Error purchasing prompt:', error);
      toast.error('Error processing purchase');
    }
  };

  const handlePreview = (prompt: SmartPrompt) => {
    setPreviewPrompt(prompt);
    setShowPreviewModal(true);
  };

  const handlePreviewPurchase = () => {
    if (previewPrompt) {
      setSelectedPromptForPurchase(previewPrompt);
      setShowPreviewModal(false);
      
      // If it's a free prompt, handle directly
      if (previewPrompt.price === 0) {
        handlePurchase(previewPrompt.id);
      } else {
        // For paid prompts, show payment modal
        setShowPaymentModal(true);
      }
    }
  };

  const handlePaymentSuccess = () => {
    toast.success('🎉 Smart Prompt purchased successfully!');
    setShowPaymentModal(false);
    setSelectedPromptForPurchase(null);
    // Refresh prompts to update purchase status
    fetchPrompts();
  };

  const renderStars = (rating: number, count: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`w-4 h-4 ${i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        />
      );
    }
    return (
      <div className="flex items-center gap-1">
        <div className="flex">{stars}</div>
        <span className="text-sm text-neutral-600 dark:text-neutral-400">({count})</span>
      </div>
    );
  };

  const PromptCard = ({ prompt }: { prompt: SmartPrompt }) => (
    <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-md border border-neutral-200 dark:border-neutral-700 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold dark:text-white mb-2">{prompt.title}</h3>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm mb-3 line-clamp-2">
            {prompt.description}
          </p>
        </div>
        <div className="text-right ml-4">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {prompt.price > 0 ? `$${prompt.price.toFixed(2)}` : 'Free'}
          </div>
          <div className="text-sm text-neutral-500">
            <Download className="w-3 h-3 inline mr-1" />
            {prompt.downloads_count}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${complexityColors[prompt.complexity_level]}`}>
          {prompt.complexity_level}
        </span>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[prompt.difficulty_level]}`}>
          {prompt.difficulty_level}
        </span>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300">
          {prompt.category}
        </span>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {prompt.tags.slice(0, 3).map(tag => (
          <span key={tag} className="px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs rounded">
            {tag}
          </span>
        ))}
        {prompt.tags.length > 3 && (
          <span className="px-2 py-1 bg-neutral-50 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 text-xs rounded">
            +{prompt.tags.length - 3} more
          </span>
        )}
      </div>

      <div className="flex items-center justify-between">
        {renderStars(prompt.rating_average, prompt.rating_count)}
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handlePreview(prompt)}
          >
            <Eye className="w-3 h-3 mr-1" />
            Preview
          </Button>
          <Button 
            size="sm" 
            onClick={() => handlePurchase(prompt.id)}
            className="min-w-20"
          >
            {prompt.price > 0 ? 'Buy' : 'Get'}
          </Button>
        </div>
      </div>

      {prompt.profiles && (
        <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-600 text-sm text-neutral-500 dark:text-neutral-400">
          by {prompt.profiles.full_name}
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold dark:text-white">Smart Prompts</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Discover and create intelligent prompt templates and recipes
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            onClick={() => setActiveView('marketplace')}
            variant={activeView === 'marketplace' ? 'default' : 'outline'}
          >
            Marketplace
          </Button>
          <Button
            onClick={() => setActiveView('builder')}
            variant={activeView === 'builder' ? 'default' : 'outline'}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create
          </Button>
        </div>
      </div>

      {activeView === 'builder' ? (
        <SmartPromptsBuilder 
          canCreateMarketplace={certificationStatus.hasValidCertificate}
          onSave={() => {
            setActiveView('marketplace');
            fetchPrompts();
          }}
        />
      ) : (
        <div className="space-y-6">
          {/* Search and Filters */}
          <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search prompts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg dark:bg-neutral-700 dark:text-white"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  value={selectedComplexity}
                  onChange={(e) => setSelectedComplexity(e.target.value)}
                  className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg dark:bg-neutral-700 dark:text-white"
                >
                  <option value="all">All Types</option>
                  <option value="simple">Simple</option>
                  <option value="smart">Smart</option>
                  <option value="recipe">Recipe</option>
                </select>

                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg dark:bg-neutral-700 dark:text-white"
                >
                  <option value="all">All Prices</option>
                  <option value="free">Free</option>
                  <option value="paid">Paid ($1-$25)</option>
                  <option value="premium">Premium ($25+)</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg dark:bg-neutral-700 dark:text-white"
                >
                  <option value="rating">Top Rated</option>
                  <option value="downloads">Most Popular</option>
                  <option value="newest">Newest</option>
                  <option value="price">Price</option>
                </select>

                <div className="flex border border-neutral-300 dark:border-neutral-600 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-neutral-600 dark:text-neutral-400'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-neutral-600 dark:text-neutral-400'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredPrompts.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-neutral-400" />
                </div>
                <h3 className="text-lg font-semibold dark:text-white mb-2">No prompts found</h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  Try adjusting your search criteria or filters
                </p>
                <Button onClick={() => setActiveView('builder')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create your first Smart Prompt
                </Button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? 's' : ''} found
                  </p>
                </div>

                <div className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                    : 'grid-cols-1'
                }`}>
                  {filteredPrompts.map(prompt => (
                    <PromptCard key={prompt.id} prompt={prompt} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewPrompt && showPreviewModal && (
        <PromptPreviewModal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          prompt={previewPrompt}
          onPurchase={handlePreviewPurchase}
          showPurchaseButton={true}
        />
      )}

      {/* Stripe Payment Modal */}
      {selectedPromptForPurchase && showPaymentModal && (
        <StripePaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedPromptForPurchase(null);
          }}
          onSuccess={handlePaymentSuccess}
          promptId={selectedPromptForPurchase.id}
          amount={selectedPromptForPurchase.price}
          promptTitle={selectedPromptForPurchase.title}
          sellerName={selectedPromptForPurchase.profiles?.full_name || 'Unknown Creator'}
        />
      )}
    </div>
  );
}