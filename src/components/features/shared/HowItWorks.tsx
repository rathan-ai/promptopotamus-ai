import React from 'react';
import Link from 'next/link';
import { Search, Edit3, CheckCircle, Award, ArrowRight, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const steps = [
  {
    icon: Search,
    title: "Discover & Explore",
    description: "Browse our curated marketplace of Smart Prompts or use our interactive tools to understand prompt engineering basics.",
    action: "Explore Smart Prompts",
    href: "/smart-prompts",
    color: "from-blue-500 to-cyan-500",
    bgColor: "from-blue-50/50 to-cyan-50/50 dark:from-blue-900/20 dark:to-cyan-900/20"
  },
  {
    icon: Edit3,
    title: "Create & Optimize", 
    description: "Use our Prompt Builder and Analyzer tools to craft effective prompts, or modify existing templates to fit your needs.",
    action: "Try Prompt Builder",
    href: "/#generator",
    color: "from-purple-500 to-pink-500",
    bgColor: "from-purple-50/50 to-pink-50/50 dark:from-purple-900/20 dark:to-pink-900/20"
  },
  {
    icon: CheckCircle,
    title: "Test & Refine",
    description: "Test your prompts across different AI platforms, gather feedback, and iterate to achieve perfect results.",
    action: "Learn Best Practices",
    href: "/#best-practices",
    color: "from-green-500 to-emerald-500",
    bgColor: "from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20"
  },
  {
    icon: Award,
    title: "Master & Certify",
    description: "Take our certification exams to validate your skills and unlock the ability to sell your own Smart Prompts.",
    action: "Get Certified",
    href: "/certificates",
    color: "from-orange-500 to-red-500",
    bgColor: "from-orange-50/50 to-red-50/50 dark:from-orange-900/20 dark:to-red-900/20"
  }
];

const HowItWorks = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-900 dark:to-neutral-800">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full text-small font-medium text-indigo-700 dark:text-indigo-300 mb-6">
            <PlayCircle className="w-4 h-4" />
            How It Works
          </div>
          <h2 className="text-h1 text-neutral-900 dark:text-white mb-6">
            Master AI Prompting in 4 Simple Steps
          </h2>
          <p className="text-body-large text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
            Whether you're a complete beginner or looking to refine your skills, our structured approach 
            will guide you from basic concepts to advanced prompt engineering mastery.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative group">
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white text-small font-bold z-10">
                  {index + 1}
                </div>
                
                {/* Card */}
                <div className={`relative p-8 rounded-2xl bg-gradient-to-br ${step.bgColor} border border-white/20 dark:border-neutral-700/50 backdrop-blur-sm group-hover:scale-105 transition-all duration-300 h-full`}>
                  {/* Icon */}
                  <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-h4 text-neutral-900 dark:text-white mb-4">
                    {step.title}
                  </h3>
                  <p className="text-body text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
                    {step.description}
                  </p>
                  
                  {/* Action */}
                  <Link href={step.href}>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full group-hover:bg-white/50 dark:group-hover:bg-neutral-800/50 transition-colors"
                    >
                      {step.action}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>

                {/* Connector Line (except for last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-indigo-300 to-purple-300 dark:from-indigo-600 dark:to-purple-600 transform -translate-y-1/2 z-10">
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-purple-400 dark:bg-purple-600 rounded-full"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default HowItWorks;