import React from 'react';
import Link from 'next/link';
import { Brain, Award, Sparkles, ArrowRight, Zap, Users, TrendingUp, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const Section = ({ id, title, children }: { id: string, title: string, children: React.ReactNode }) => (
    <section id={id} className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/50 dark:from-indigo-900/10 dark:via-purple-900/5 dark:to-pink-900/10 rounded-3xl -z-10"></div>
      <div className="relative z-10 p-8 md:p-12">
        <h1 className="text-display gradient-text text-center mb-8 animate-fade-in">
          {title}
        </h1>
        <div className="prose dark:prose-invert max-w-none text-neutral-700 dark:text-neutral-300">{children}</div>
      </div>
    </section>
);

export default function Introduction() {
  return (
    <Section id="introduction" title="Welcome to Promptopotamus">
      {/* Hero Content */}
      <div className="text-center mb-12">
        <p className="text-body-large text-neutral-600 dark:text-neutral-400 mb-8 max-w-4xl mx-auto leading-relaxed">
          Master the art and science of <span className="font-semibold text-indigo-600 dark:text-indigo-400">AI prompting</span>. 
          Transform your AI interactions with professionally crafted prompts, comprehensive guides, and certification programs.
        </p>
        
        {/* Key Value Props */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="group p-6 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-neutral-700/50 hover:bg-white/70 dark:hover:bg-neutral-800/70 transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-h4 text-neutral-900 dark:text-white mb-2">Smart Prompts</h3>
            <p className="text-small text-neutral-600 dark:text-neutral-400">
              Browse and purchase prompts from certified creators
            </p>
          </div>
          
          <div className="group p-6 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-neutral-700/50 hover:bg-white/70 dark:hover:bg-neutral-800/70 transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-h4 text-neutral-900 dark:text-white mb-2">Get Certified</h3>
            <p className="text-small text-neutral-600 dark:text-neutral-400">
              Earn official certifications in prompt engineering and AI mastery
            </p>
          </div>
          
          <div className="group p-6 bg-white/50 dark:bg-neutral-800/50 backdrop-blur-sm rounded-2xl border border-white/20 dark:border-neutral-700/50 hover:bg-white/70 dark:hover:bg-neutral-800/70 transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-h4 text-neutral-900 dark:text-white mb-2">Interactive Tools</h3>
            <p className="text-small text-neutral-600 dark:text-neutral-400">
              Build, analyze, and optimize prompts with our AI-powered tools
            </p>
          </div>
        </div>

      </div>

      {/* Enhanced CTA Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 dark:from-blue-400/10 dark:via-purple-400/10 dark:to-pink-400/10 rounded-2xl blur-xl"></div>
        <div className="relative glass rounded-2xl p-8 text-center">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full text-small font-medium text-indigo-700 dark:text-indigo-300 mb-4">
              <Sparkles className="w-4 h-4" />
              Start Your AI Journey Today
            </div>
            <h2 className="text-h2 text-neutral-900 dark:text-white mb-4">
              Ready to Transform Your AI Experience?
            </h2>
            <p className="text-body-large text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
              Start mastering AI prompting today. Whether you're a beginner or expert, 
              we have the tools and knowledge to elevate your AI interactions.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link href="/smart-prompts">
              <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 group">
                <Brain className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Explore Smart Prompts
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            
            <Link href="/certificates">
              <Button size="lg" variant="outline" className="border-2 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
                <Award className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Get Certified
              </Button>
            </Link>
          </div>

          <div className="text-small text-neutral-500 dark:text-neutral-400">
            Pay only for what you use • No subscriptions required
          </div>
        </div>
      </div>
    </Section>
  );
}