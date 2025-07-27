import { Metadata } from 'next';
import { Check, Star, Crown, Zap, ArrowRight, HelpCircle, Coins } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'PromptCoin Packages - Promptopotamus',
  description: 'Choose the perfect PromptCoin package for your AI prompt engineering needs. Pay only for what you use with our flexible credit system.',
};

const packages = [
  {
    name: 'Free Daily',
    description: 'Perfect for getting started with AI prompting',
    price: '$0',
    promptCoins: 'Daily Credits',
    icon: Star,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
    popular: false,
    features: [
      { name: '3 prompt enhancements daily (45 PC)', included: true },
      { name: '5 prompt analyses daily (50 PC)', included: true },
      { name: '3 exam attempts daily (150 PC)', included: true },
      { name: 'Basic prompt templates', included: true },
      { name: 'Community access', included: true },
      { name: 'Basic learning guides', included: true },
      { name: 'Email support', included: true },
      { name: 'Export features', included: false },
      { name: 'Smart Recipe purchases', included: false }
    ],
    cta: 'Get Started Free',
    href: '/login'
  },
  {
    name: 'Starter Pack',
    description: 'Great for casual users and learners',
    price: '$5',
    promptCoins: '500 PC',
    icon: Coins,
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20',
    popular: false,
    features: [
      { name: '33 prompt enhancements (500 PC)', included: true },
      { name: '50 prompt analyses (500 PC)', included: true },
      { name: '10 exam attempts (500 PC)', included: true },
      { name: '100 export operations (500 PC)', included: true },
      { name: 'Smart Recipe purchases', included: true },
      { name: 'All prompt templates', included: true },
      { name: 'Priority email support', included: true },
      { name: 'No expiration on credits', included: true }
    ],
    cta: 'Buy Starter Pack',
    href: '/purchase?package=starter'
  },
  {
    name: 'Pro Pack',
    description: 'Ideal for professionals and active users',
    price: '$20',
    promptCoins: '2,000 PC',
    icon: Crown,
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
    popular: true,
    features: [
      { name: '133 prompt enhancements (2,000 PC)', included: true },
      { name: '200 prompt analyses (2,000 PC)', included: true },
      { name: '40 exam attempts (2,000 PC)', included: true },
      { name: '400 export operations (2,000 PC)', included: true },
      { name: 'Smart Recipe purchases', included: true },
      { name: 'All prompt templates', included: true },
      { name: 'Priority support', included: true },
      { name: 'No expiration on credits', included: true }
    ],
    cta: 'Buy Pro Pack',
    href: '/purchase?package=pro'
  },
  {
    name: 'Premium Pack',
    description: 'Perfect for power users and teams',
    price: '$50',
    promptCoins: '5,000 PC',
    icon: Zap,
    color: 'from-orange-500 to-red-500',
    bgColor: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
    popular: false,
    features: [
      { name: '333 prompt enhancements (5,000 PC)', included: true },
      { name: '500 prompt analyses (5,000 PC)', included: true },
      { name: '100 exam attempts (5,000 PC)', included: true },
      { name: '1,000 export operations (5,000 PC)', included: true },
      { name: 'Smart Recipe purchases', included: true },
      { name: 'All prompt templates', included: true },
      { name: 'Priority support', included: true },
      { name: 'No expiration on credits', included: true }
    ],
    cta: 'Buy Premium Pack',
    href: '/purchase?package=premium'
  }
];

const faqs = [
  {
    question: 'How do PromptCoins work?',
    answer: 'PromptCoins are credits you can use for various features. Each action costs a specific amount: 15 PC for enhancements, 10 PC for analyses, 50 PC for exams, and 5 PC for exports. You only pay for what you use!'
  },
  {
    question: 'Do PromptCoins expire?',
    answer: 'No! Your PromptCoins never expire. Buy once and use them whenever you need to, making it perfect for occasional users.'
  },
  {
    question: 'Can I buy more PromptCoins anytime?',
    answer: 'Absolutely! You can purchase additional PromptCoin packages whenever you need more credits. Your balances stack up automatically.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards and PayPal for PromptCoin purchases. All transactions are secure and processed instantly.'
  },
  {
    question: 'Can I get a refund?',
    answer: 'All PromptCoin purchases are final. Please carefully consider your needs before purchasing.'
  },
  {
    question: 'How much does each action cost?',
    answer: 'Prompt Enhancement: 15 PC, Prompt Analysis: 10 PC, Exam Attempt: 50 PC, Export Feature: 5 PC. Smart Recipe prices vary based on complexity ($1-$10 each).'
  }
];

export default function PricingPage() {
  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="text-center py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-display gradient-text mb-6">
            Pay-Per-Use PromptCoin Packages
          </h1>
          <p className="text-body-large text-neutral-600 dark:text-neutral-400 leading-relaxed mb-8">
            No subscriptions, no commitments. Buy PromptCoins once and use them forever. 
            Perfect for both casual users and power users who want flexible pricing.
          </p>
          
          {/* PromptCoin Info */}
          <div className="inline-flex items-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg mb-12">
            <Coins className="w-6 h-6 text-indigo-600 dark:text-indigo-400 mr-3" />
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              100 PromptCoins = $1 USD • Credits Never Expire • Use Anytime
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {packages.map((pkg, index) => {
            const Icon = pkg.icon;
            return (
              <div 
                key={index} 
                className={`
                  relative p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105
                  ${pkg.popular 
                    ? 'border-indigo-500 shadow-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20' 
                    : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50'
                  }
                `}
              >
                {pkg.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}
                
                {/* Header */}
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${pkg.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-h3 text-neutral-900 dark:text-white mb-2">{pkg.name}</h3>
                  <p className="text-body text-neutral-600 dark:text-neutral-400 mb-4">{pkg.description}</p>
                  
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-neutral-900 dark:text-white">{pkg.price}</span>
                  </div>
                  <div className="mb-4">
                    <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">{pkg.promptCoins}</span>
                  </div>
                  
                  <Link href={pkg.href}>
                    <Button 
                      className={`w-full ${pkg.popular 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' 
                        : ''
                      }`}
                      variant={pkg.popular ? 'default' : 'outline'}
                    >
                      {pkg.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
                
                {/* Features */}
                <div className="space-y-3">
                  {pkg.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-neutral-700 dark:text-neutral-300">
                        {feature.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>


      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-h1 text-neutral-900 dark:text-white mb-6">
            PromptCoin Questions
          </h2>
          <p className="text-body-large text-neutral-600 dark:text-neutral-400">
            Everything you need to know about our pay-per-use system.
          </p>
        </div>
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="p-6 bg-white dark:bg-neutral-800/50 rounded-2xl border border-neutral-200 dark:border-neutral-700/50">
              <div className="flex items-start gap-4">
                <HelpCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-h4 text-neutral-900 dark:text-white mb-3">{faq.question}</h3>
                  <p className="text-body text-neutral-600 dark:text-neutral-400 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-body text-neutral-600 dark:text-neutral-400 mb-4">
            Need help with PromptCoins?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/help/promptcoins">
              <Button>
                PromptCoin Help Center
              </Button>
            </Link>
            <Link href="mailto:contact@innorag.com">
              <Button variant="outline">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="text-center py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span>Credits never expire</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span>Secure payments</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}