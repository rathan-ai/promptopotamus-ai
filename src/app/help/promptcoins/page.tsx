import { Metadata } from 'next';
import { Coins, ArrowRight, DollarSign, Clock, Shield, HelpCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'PromptCoin Help - Promptopotamus',
  description: 'Everything you need to know about PromptCoins - our flexible pay-per-use credit system.',
};

const faqs = [
  {
    question: 'What are PromptCoins?',
    answer: 'PromptCoins are digital credits that let you pay only for the features you use. Instead of monthly subscriptions, you purchase credits once and use them whenever you need our premium features.',
    category: 'basics'
  },
  {
    question: 'How much do features cost?',
    answer: 'Our features cost: Prompt Analysis (10 PC), Prompt Enhancement (15 PC), Exam Attempts (50 PC), Export Features (5 PC). Smart Recipe purchases vary from 100-1000 PC ($1-$10) based on complexity.',
    category: 'pricing'
  },
  {
    question: 'Do PromptCoins expire?',
    answer: 'No! PromptCoins never expire. Buy once and use them whenever you want - perfect for occasional users who don\'t want monthly commitments.',
    category: 'basics'
  },
  {
    question: 'What\'s the conversion rate?',
    answer: '100 PromptCoins = $1 USD. This makes it easy to understand pricing - a $5 purchase gives you 500 PromptCoins.',
    category: 'pricing'
  },
  {
    question: 'Can I get a refund?',
    answer: 'Yes! We offer a 30-day money-back guarantee for all PromptCoin purchases. Unused credits can be refunded within 30 days of purchase.',
    category: 'refunds'
  },
  {
    question: 'How do I buy more PromptCoins?',
    answer: 'You can purchase PromptCoins anytime from our pricing page, through upgrade prompts in the app, or when you run low on credits. We accept credit cards and PayPal.',
    category: 'purchasing'
  },
  {
    question: 'What happens if I run out of credits?',
    answer: 'You\'ll see a prompt to purchase more PromptCoins. You can continue using free features like basic templates and daily credits while deciding whether to buy more.',
    category: 'usage'
  },
  {
    question: 'Can I track my PromptCoin usage?',
    answer: 'Yes! Your dashboard shows your current balance broken down by category (Analysis, Enhancement, Exam, Export) and your usage history.',
    category: 'usage'
  },
  {
    question: 'Are there bulk discounts?',
    answer: 'Our larger packages offer better value - Pro Pack ($20 for 2000 PC) and Premium Pack ($50 for 5000 PC) give you more credits per dollar than smaller purchases.',
    category: 'pricing'
  },
  {
    question: 'Can I share PromptCoins with my team?',
    answer: 'Currently, PromptCoins are tied to individual accounts. For team needs, contact us about enterprise options with shared credit pools.',
    category: 'usage'
  }
];

const packages = [
  {
    name: 'Starter Pack',
    price: '$5',
    coins: '500 PC',
    features: ['33 prompt enhancements', '50 prompt analyses', '10 exam attempts', '100 export operations'],
    color: 'from-blue-500 to-cyan-500'
  },
  {
    name: 'Pro Pack',
    price: '$20',
    coins: '2,000 PC',
    features: ['133 prompt enhancements', '200 prompt analyses', '40 exam attempts', '400 export operations'],
    color: 'from-indigo-500 to-purple-500',
    popular: true
  },
  {
    name: 'Premium Pack',
    price: '$50',
    coins: '5,000 PC',
    features: ['333 prompt enhancements', '500 prompt analyses', '100 exam attempts', '1,000 export operations'],
    color: 'from-orange-500 to-red-500'
  }
];

export default function PromptCoinHelp() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Coins className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-display gradient-text mb-6">
          PromptCoin Help Center
        </h1>
        <p className="text-body-large text-neutral-600 dark:text-neutral-400 leading-relaxed max-w-3xl mx-auto">
          Everything you need to know about our flexible pay-per-use credit system. 
          No subscriptions, no commitments - just pay for what you use.
        </p>
      </div>

      {/* Key Benefits */}
      <div className="grid md:grid-cols-3 gap-6 mb-16">
        <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700/50 text-center">
          <Clock className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-3" />
          <h3 className="font-semibold text-green-900 dark:text-green-200 mb-2">Never Expire</h3>
          <p className="text-green-700 dark:text-green-300 text-sm">Buy once, use anytime. Perfect for occasional users.</p>
        </div>
        <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700/50 text-center">
          <DollarSign className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-3" />
          <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Pay Per Use</h3>
          <p className="text-blue-700 dark:text-blue-300 text-sm">Only pay for features you actually need and use.</p>
        </div>
        <div className="p-6 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-700/50 text-center">
          <Shield className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-3" />
          <h3 className="font-semibold text-purple-900 dark:text-purple-200 mb-2">30-Day Guarantee</h3>
          <p className="text-purple-700 dark:text-purple-300 text-sm">Full refund on unused credits within 30 days.</p>
        </div>
      </div>

      {/* Packages Overview */}
      <section className="mb-16">
        <h2 className="text-h1 text-neutral-900 dark:text-white mb-8 text-center">Available Packages</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {packages.map((pkg, index) => (
            <div 
              key={index}
              className={`relative p-6 rounded-2xl border-2 transition-all ${
                pkg.popular 
                  ? 'border-indigo-500 shadow-lg bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20' 
                  : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50'
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">{pkg.name}</h3>
                <div className="mb-2">
                  <span className="text-3xl font-bold text-neutral-900 dark:text-white">{pkg.price}</span>
                </div>
                <span className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">{pkg.coins}</span>
              </div>
              <ul className="space-y-2">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="text-sm text-neutral-600 dark:text-neutral-400">• {feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/pricing">
            <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
              View All Packages
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* FAQ Sections */}
      <section>
        <h2 className="text-h1 text-neutral-900 dark:text-white mb-8 text-center">Frequently Asked Questions</h2>
        
        {['basics', 'pricing', 'usage', 'purchasing', 'refunds'].map((category) => {
          const categoryFaqs = faqs.filter(faq => faq.category === category);
          const categoryNames = {
            basics: 'Getting Started',
            pricing: 'Pricing & Costs',
            usage: 'Using PromptCoins',
            purchasing: 'Purchasing',
            refunds: 'Refunds & Support'
          };
          
          return (
            <div key={category} className="mb-12">
              <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-6">
                {categoryNames[category as keyof typeof categoryNames]}
              </h3>
              <div className="space-y-4">
                {categoryFaqs.map((faq, index) => (
                  <div key={index} className="p-6 bg-white dark:bg-neutral-800/50 rounded-xl border border-neutral-200 dark:border-neutral-700/50">
                    <div className="flex items-start gap-4">
                      <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-1" />
                      <div>
                        <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">{faq.question}</h4>
                        <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">{faq.answer}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Contact Section */}
      <section className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-8 text-center">
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
          Still Have Questions?
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          Our support team is here to help you make the most of your PromptCoins.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="mailto:support@promptopotamus.com">
            <Button variant="outline">
              Email Support
            </Button>
          </Link>
          <Link href="/refund-policy">
            <Button variant="outline">
              Refund Policy
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}