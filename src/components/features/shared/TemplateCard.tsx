'use client';

import { Copy, Crown, Star, Users, Lock } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import type { AITemplate } from '@/lib/data';
import { track } from '@vercel/analytics';
import { useRouter } from 'next/navigation';

interface TemplateCardProps {
  template: AITemplate;
}

export default function TemplateCard({ template }: TemplateCardProps) {
  const { title, prompt, tier, tags, usageCount, rating } = template;
  const router = useRouter();
  
  const handleCopy = () => {
    if (tier === 'premium' || tier === 'pro') {
      // Track premium template access attempt
      track('template_premium_blocked', {
        template_id: template.id,
        template_name: title,
        template_tier: tier,
        template_category: template.category
      });
      toast.error('Premium templates require payment. Click to purchase access.');
      return;
    }
    
    // Track successful template copy
    track('template_copied', {
      template_id: template.id,
      template_name: title,
      template_tier: tier,
      template_category: template.category,
      template_usage_count: usageCount || 0
    });
    
    navigator.clipboard.writeText(prompt);
    toast.success('Prompt copied to clipboard!');
  };

  const handlePurchase = async () => {
    // Track purchase button click
    track('template_purchase_clicked', {
      template_id: template.id,
      template_name: title,
      template_tier: tier,
      template_category: template.category
    });
    
    try {
      // Check if user is authenticated first
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        // User not authenticated, redirect to login
        router.push('/login?redirect=templates');
        return;
      }
      
      // User is authenticated, proceed with purchase
      // TODO: Implement actual purchase flow for premium templates
      toast.success('Purchase feature coming soon! For now, all templates are free.');
      
    } catch (error) {
      console.error('Error checking authentication:', error);
      // Fallback to login redirect
      router.push('/login?redirect=templates');
    }
  };

  const getTierConfig = (tier: string) => {
    switch (tier) {
      case 'free':
        return { 
          icon: null, 
          color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
          label: 'Free' 
        };
      case 'pro':
        return { 
          icon: Star, 
          color: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
          label: 'Paid' 
        };
      case 'premium':
        return { 
          icon: Crown, 
          color: 'bg-slate-300 text-slate-900 dark:bg-slate-600 dark:text-slate-100',
          label: 'Premium' 
        };
      default:
        return { 
          icon: null, 
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
          label: 'Free' 
        };
    }
  };

  const tierConfig = getTierConfig(tier);
  const isPremium = tier === 'premium' || tier === 'pro';

  return (
    <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700 flex flex-col hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 flex-1">{title}</h3>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${tierConfig.color}`}>
          {tierConfig.icon && <tierConfig.icon className="w-3 h-3" />}
          {tierConfig.label}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-3 text-sm text-neutral-500 dark:text-neutral-400">
        {rating && (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-slate-500 fill-current" />
            <span>{rating}</span>
          </div>
        )}
        {usageCount && (
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{usageCount.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Prompt */}
      <div className="flex-grow mb-4">
        {isPremium ? (
          <div className="relative">
            <p className="text-sm text-neutral-400 dark:text-neutral-500 blur-sm select-none">
              {prompt.substring(0, 100)}...
            </p>
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-white/90 to-transparent dark:from-neutral-800/90">
              <Lock className="w-8 h-8 text-neutral-400" />
            </div>
          </div>
        ) : (
          <p className="text-sm text-neutral-600 dark:text-neutral-400">{prompt}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {isPremium ? (
          <Button onClick={handlePurchase} size="sm" className="flex-1">
            <Crown className="mr-2 h-4 w-4" />
            Buy Template
          </Button>
        ) : (
          <Button onClick={handleCopy} variant="secondary" size="sm" className="flex-1">
            <Copy className="mr-2 h-4 w-4" />
            Copy Prompt
          </Button>
        )}
      </div>
    </div>
  );
}