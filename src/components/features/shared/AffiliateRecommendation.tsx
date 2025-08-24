'use client';

import { useState, useEffect } from 'react';
import { ExternalLink, Sparkles, TrendingUp, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { affiliateTracker } from '@/lib/affiliate-tracking';
import toast from 'react-hot-toast';

interface AffiliatePartner {
  partnerKey: string;
  partnerName: string;
  commissionRate: number;
}

interface AffiliateRecommendationProps {
  context: 'prompt_creation' | 'marketplace_browse' | 'certificate_earned';
  category?: string;
  promptTags?: string[];
  className?: string;
  style?: 'card' | 'inline' | 'banner';
  maxRecommendations?: number;
}

const PartnerIcons = {
  openai: { icon: Sparkles, color: 'text-emerald-600 dark:text-emerald-500' },
  anthropic: { icon: Zap, color: 'text-slate-600 dark:text-purple-400' },
  jasper: { icon: TrendingUp, color: 'text-orange-600 dark:text-orange-400' },
  default: { icon: ExternalLink, color: 'text-slate-600 dark:text-slate-400' }
};

const ContextMessages = {
  prompt_creation: {
    title: 'Enhance Your Prompts',
    description: 'Try these AI tools for better results:'
  },
  marketplace_browse: {
    title: 'Recommended Tools',
    description: 'Popular with creators:'
  },
  certificate_earned: {
    title: 'Ready for Advanced Tools?',
    description: 'Unlock professional features:'
  }
};

export default function AffiliateRecommendation({
  context,
  category,
  promptTags = [],
  className = '',
  style = 'card',
  maxRecommendations = 2
}: AffiliateRecommendationProps) {
  const [recommendations, setRecommendations] = useState<AffiliatePartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, [context, category]);

  const fetchRecommendations = async () => {
    try {
      const response = await fetch(`/api/affiliate/track?context=${context}&category=${category || ''}`);
      const data = await response.json();
      
      if (data.success) {
        setRecommendations(data.recommendations.slice(0, maxRecommendations));
      }
    } catch (error) {
      console.error('Error fetching affiliate recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAffiliateClick = async (partnerKey: string, partnerName: string) => {
    try {
      const response = await fetch('/api/affiliate/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerKey,
          source: context,
          customParams: {
            category: category || 'general',
            tags: promptTags.join(','),
            content: `${context}_recommendation`
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Open affiliate URL in new tab
        window.open(data.affiliateUrl, '_blank', 'noopener,noreferrer');
        
        // Show success message
        toast.success(`Opening ${partnerName}... 🚀`);
        
        // Track engagement
        // You can add additional analytics tracking here
      } else {
        toast.error('Unable to open affiliate link');
      }
    } catch (error) {
      console.error('Error handling affiliate click:', error);
      toast.error('Something went wrong');
    }
  };

  if (loading || dismissed || recommendations.length === 0) {
    return null;
  }

  const contextInfo = ContextMessages[context];

  // Inline style - simple text with links
  if (style === 'inline') {
    return (
      <div className={`flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400 ${className}`}>
        <span>{contextInfo.description}</span>
        {recommendations.map((partner, index) => {
          const { icon: Icon, color } = PartnerIcons[partner.partnerKey as keyof typeof PartnerIcons] || PartnerIcons.default;
          return (
            <button
              key={partner.partnerKey}
              onClick={() => handleAffiliateClick(partner.partnerKey, partner.partnerName)}
              className={`inline-flex items-center gap-1 font-medium hover:underline ${color}`}
            >
              <Icon className="w-3 h-3" />
              {partner.partnerName}
            </button>
          );
        })}
      </div>
    );
  }

  // Banner style - horizontal banner
  if (style === 'banner') {
    return (
      <div className={`bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">{contextInfo.title}</h4>
            <p className="text-sm text-slate-700 dark:text-blue-300">{contextInfo.description}</p>
          </div>
          <div className="flex gap-2 ml-4">
            {recommendations.map((partner) => {
              const { icon: Icon, color } = PartnerIcons[partner.partnerKey as keyof typeof PartnerIcons] || PartnerIcons.default;
              return (
                <Button
                  key={partner.partnerKey}
                  size="sm"
                  variant="outline"
                  onClick={() => handleAffiliateClick(partner.partnerKey, partner.partnerName)}
                  className="text-xs"
                >
                  <Icon className="w-3 h-3 mr-1" />
                  Try {partner.partnerName}
                </Button>
              );
            })}
          </div>
          <button
            onClick={() => setDismissed(true)}
            className="ml-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
          >
            ×
          </button>
        </div>
      </div>
    );
  }

  // Card style - default
  return (
    <div className={`bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold dark:text-white">{contextInfo.title}</h4>
        <button
          onClick={() => setDismissed(true)}
          className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
        >
          ×
        </button>
      </div>
      
      <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4">
        {contextInfo.description}
      </p>
      
      <div className="space-y-2">
        {recommendations.map((partner) => {
          const { icon: Icon, color } = PartnerIcons[partner.partnerKey as keyof typeof PartnerIcons] || PartnerIcons.default;
          return (
            <button
              key={partner.partnerKey}
              onClick={() => handleAffiliateClick(partner.partnerKey, partner.partnerName)}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-neutral-200 dark:border-neutral-600 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all group"
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${color}`} />
                <div className="text-left">
                  <p className="font-medium dark:text-white group-hover:text-slate-600 dark:group-hover:text-slate-400">
                    {partner.partnerName}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    Recommended for {context.replace('_', ' ')}
                  </p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-neutral-400 group-hover:text-slate-500" />
            </button>
          );
        })}
      </div>
      
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3 text-center">
        Affiliate partnerships help support Promptopotamus ❤️
      </p>
    </div>
  );
}

// Contextual wrapper components for easier integration
export const PromptCreationAffiliateRec = ({ category, tags, className }: { 
  category?: string; 
  tags?: string[]; 
  className?: string; 
}) => (
  <AffiliateRecommendation
    context="prompt_creation"
    category={category}
    promptTags={tags}
    className={className}
    style="banner"
  />
);

export const MarketplaceBrowseAffiliateRec = ({ category, className }: { 
  category?: string; 
  className?: string; 
}) => (
  <AffiliateRecommendation
    context="marketplace_browse"
    category={category}
    className={className}
    style="inline"
  />
);

export const CertificateEarnedAffiliateRec = ({ level, className }: { 
  level?: string; 
  className?: string; 
}) => (
  <AffiliateRecommendation
    context="certificate_earned"
    category={level}
    className={className}
    style="card"
  />
);