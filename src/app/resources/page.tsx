'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ExternalLink, Star, Zap, Brain, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { track } from '@vercel/analytics';

interface AffiliateResource {
  id: number;
  name: string;
  provider: string;
  description: string;
  price: string;
  category: string;
  badge: string;
  color: string;
  icon: string;
  affiliate_link: string;
  features: string[];
  rating: number;
  is_active: boolean;
  display_order: number;
}



export default function ResourcesPage() {
  const [affiliateResources, setAffiliateResources] = useState<AffiliateResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAffiliateResources = async () => {
      try {
        const response = await fetch('/api/affiliates');
        if (response.ok) {
          const data = await response.json();
          setAffiliateResources(data);
        } else {
          console.error('Failed to fetch affiliate resources');
        }
      } catch (error) {
        console.error('Error fetching affiliate resources:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAffiliateResources();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center py-12">
          <div className="text-lg text-neutral-600 dark:text-neutral-400">Loading affiliate resources...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          AI Tools & Resources
        </h1>
        <p className="text-xl text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto">
          Curated AI tools and platforms to enhance your prompt engineering workflow.
        </p>
      </div>

      {/* Featured Banner */}
      <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">🚀 Start Your AI Journey Today!</h2>
            <p className="text-indigo-100 mb-4">
              These tools are what our top-certified prompt engineers use daily. Start with any free tier and upgrade as you grow!
            </p>
            <div className="flex gap-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-sm">All links support Promptopotamus development</span>
            </div>
          </div>
          <div className="hidden md:block text-6xl opacity-20">
            🎯
          </div>
        </div>
      </div>

      {/* Resource Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {affiliateResources.map((resource) => (
          <div key={resource.id} className="group relative bg-white dark:bg-neutral-800 rounded-xl shadow-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            {/* Badge */}
            <div className={`absolute top-4 right-4 ${resource.color} text-white px-3 py-1 rounded-full text-xs font-semibold z-10`}>
              {resource.badge}
            </div>
            
            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{resource.icon}</div>
                  <div>
                    <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
                      {resource.name}
                    </h3>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">
                      by {resource.provider}
                    </p>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(resource.rating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-neutral-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {resource.rating}
                </span>
              </div>

              {/* Description */}
              <p className="text-neutral-600 dark:text-neutral-300 mb-4 line-clamp-2">
                {resource.description}
              </p>

              {/* Features */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {resource.features.slice(0, 2).map((feature) => (
                    <span
                      key={feature}
                      className="bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 px-2 py-1 rounded text-xs"
                    >
                      {feature}
                    </span>
                  ))}
                  {resource.features.length > 2 && (
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 px-2 py-1">
                      +{resource.features.length - 2} more
                    </span>
                  )}
                </div>
              </div>

              {/* Price and CTA */}
              <div className="flex items-center justify-between">
                <div className="text-lg font-bold text-neutral-900 dark:text-white">
                  {resource.price}
                </div>
                <Link 
                  href={resource.affiliate_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  onClick={() => {
                    // Track affiliate resource click
                    track('affiliate_click_resource', {
                      resource_id: resource.id,
                      resource_name: resource.name,
                      provider: resource.provider,
                      price: resource.price,
                      category: resource.category,
                      rating: resource.rating,
                      badge: resource.badge,
                      source: 'resources_page'
                    });
                  }}
                >
                  <Button size="sm" className="group-hover:scale-105 transition-transform">
                    Try Now
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </div>
        ))}
      </div>

      {/* Call to Action */}
      <div className="bg-neutral-100 dark:bg-neutral-800 rounded-2xl p-8 text-center">
        <Brain className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-white">
          Ready to Master Prompt Engineering?
        </h2>
        <p className="text-neutral-600 dark:text-neutral-300 mb-6 max-w-2xl mx-auto">
          Start with our free certification program and use these premium tools to practice. 
          Our community of certified engineers is here to support your journey.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/certificates">
            <Button size="lg">
              Start Free Certification
              <Zap className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="/templates">
            <Button variant="outline" size="lg">
              Browse Templates
            </Button>
          </Link>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="text-center text-sm text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-4">
        <p>
          💡 <strong>Transparency Note:</strong> Some links above are affiliate links. 
          When you purchase through these links, you support Promptopotamus at no extra cost to you. 
          We only recommend tools our team actually uses and loves.
        </p>
      </div>
    </div>
  );
}