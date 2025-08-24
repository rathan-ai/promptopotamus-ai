'use client';
import { useState } from 'react';
import { aiTemplates, type AITemplate } from '@/lib/data';
import TemplateCard from '@/components/features/shared/TemplateCard';
import { Filter, Search, Crown, Star } from 'lucide-react';
import { track } from '@vercel/analytics';

export default function TemplatesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  // Removed tier filter - all templates are free
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Get unique categories
  const categories = Array.from(new Set(aiTemplates.map(template => template.category)));

  // Filter templates
  const filteredTemplates = aiTemplates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || template.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Group filtered templates
  const groupedTemplates: Record<string, AITemplate[]> = {};
  filteredTemplates.forEach(template => {
    if (!groupedTemplates[template.category]) {
      groupedTemplates[template.category] = [];
    }
    groupedTemplates[template.category].push(template);
  });

  const templateCount = aiTemplates.length;

  return (
    <div className="w-full max-w-none">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-extrabold dark:text-white mb-4">AI Templates & Prompt Packs</h1>
        <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
          A library of powerful, ready-to-use prompts to supercharge your workflow.
        </p>
        
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 mb-8 shadow-md">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  if (e.target.value) {
                    track('template_search', {
                      search_term: e.target.value,
                      results_count: filteredTemplates.length
                    });
                  }
                }}
              />
            </div>
          </div>

          {/* Free Templates Badge */}
          <div className="px-4 py-2 bg-green-100 dark:bg-green-900/30 text-emerald-700 dark:text-green-300 rounded-lg text-sm font-medium">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              <span>{templateCount} Free Templates Available</span>
            </div>
          </div>

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              track('template_filter_category', {
                selected_category: e.target.value
              });
            }}
            className="px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {Object.keys(groupedTemplates).length === 0 ? (
        <div className="text-center py-12">
          <div className="text-neutral-400 mb-4">
            <Filter className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-neutral-600 dark:text-neutral-400 mb-2">
            No templates found
          </h3>
          <p className="text-neutral-500">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {Object.entries(groupedTemplates).map(([category, templates]) => (
            <section key={category}>
              <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-neutral-300 dark:border-neutral-700 dark:text-white flex items-center justify-between">
                <span>{category}</span>
                <span className="text-sm font-normal text-neutral-500">
                  {templates.length} template{templates.length !== 1 ? 's' : ''}
                </span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map(template => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}