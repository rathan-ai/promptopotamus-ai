import { Metadata } from 'next';
import { Check, X, Star, Crown, Zap, Users, ArrowRight, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Pricing - Promptopotamus',
  description: 'Choose the perfect plan for your AI prompt engineering journey. Free tools, Pro features, and Enterprise solutions.',
};

const plans = [
  {
    name: 'Free',
    description: 'Perfect for getting started with AI prompting',
    price: '$0',
    period: 'forever',
    icon: Star,
    color: 'from-green-500 to-emerald-500',
    bgColor: 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20',
    popular: false,
    features: [
      { name: '3 AI prompt enhancements daily', included: true },
      { name: '5 prompt analyses daily', included: true },
      { name: 'Basic prompt templates', included: true },
      { name: 'Community access', included: true },
      { name: 'Basic learning guides', included: true },
      { name: 'Email support', included: true },
      { name: 'Unlimited prompt building', included: true },
      { name: 'Advanced AI features', included: false },
      { name: 'Priority support', included: false },
      { name: 'Custom certifications', included: false }
    ],
    cta: 'Get Started Free',
    href: '/login'
  },
  {
    name: 'Pro',
    description: 'Ideal for professionals and active learners',
    price: '$19',
    period: 'per month',
    icon: Crown,
    color: 'from-indigo-500 to-purple-500',
    bgColor: 'from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20',
    popular: true,
    features: [
      { name: '25 AI prompt enhancements daily', included: true },
      { name: '50 prompt analyses daily', included: true },
      { name: 'Premium prompt templates', included: true },
      { name: 'Priority community access', included: true },
      { name: 'Advanced learning guides', included: true },
      { name: 'Priority email support', included: true },
      { name: 'Unlimited prompt building', included: true },
      { name: 'Advanced AI features', included: true },
      { name: 'Export capabilities', included: true },
      { name: 'Custom certifications', included: false }
    ],
    cta: 'Start Pro Trial',
    href: '/login?plan=pro'
  },
  {
    name: 'Premium',
    description: 'Unlimited access for power users and teams',
    price: '$49',
    period: 'per month',
    icon: Zap,
    color: 'from-orange-500 to-red-500',
    bgColor: 'from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20',
    popular: false,
    features: [
      { name: 'Unlimited AI enhancements', included: true },
      { name: 'Unlimited prompt analyses', included: true },
      { name: 'All prompt templates', included: true },
      { name: 'VIP community access', included: true },
      { name: 'Expert learning guides', included: true },
      { name: '24/7 priority support', included: true },
      { name: 'Unlimited prompt building', included: true },
      { name: 'Advanced AI features', included: true },
      { name: 'Team collaboration tools', included: true },
      { name: 'Custom certifications', included: true }
    ],
    cta: 'Go Premium',
    href: '/login?plan=premium'
  }
];

const faqs = [
  {
    question: 'Can I change plans anytime?',
    answer: 'Yes! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect at your next billing cycle.'
  },
  {
    question: 'What happens to my data if I cancel?',
    answer: 'Your account data remains accessible for 30 days after cancellation. You can reactivate anytime during this period.'
  },
  {
    question: 'Do you offer student discounts?',
    answer: 'Yes! Students with valid .edu email addresses receive 50% off Pro and Premium plans. Contact support for verification.'
  },
  {
    question: 'Is there a free trial for paid plans?',
    answer: 'Yes! All paid plans come with a 14-day free trial. No credit card required to start.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, and bank transfers for annual subscriptions.'
  },
  {
    question: 'Can I get a refund?',
    answer: 'We offer a 30-day money-back guarantee for all paid plans. No questions asked.'
  }
];

export default function PricingPage() {
  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="text-center py-24">
        <div className="max-w-4xl mx-auto px-6">
          <h1 className="text-display gradient-text mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-body-large text-neutral-600 dark:text-neutral-400 leading-relaxed mb-8">
            Choose the perfect plan for your AI prompt engineering journey. Start free, 
            upgrade when you need more power, and cancel anytime.
          </p>
          
          {/* Billing Toggle */}
          <div className="inline-flex items-center p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg mb-12">
            <button className="px-4 py-2 bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white rounded-md shadow-sm text-sm font-medium">
              Monthly
            </button>
            <button className="px-4 py-2 text-neutral-600 dark:text-neutral-400 text-sm font-medium">
              Annual (Save 20%)
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            return (
              <div 
                key={index} 
                className={`
                  relative p-8 rounded-2xl border-2 transition-all duration-300 hover:scale-105
                  ${plan.popular 
                    ? 'border-indigo-500 shadow-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20' 
                    : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800/50'
                  }
                `}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </div>
                  </div>
                )}
                
                {/* Header */}
                <div className="text-center mb-8">
                  <div className={`w-16 h-16 bg-gradient-to-br ${plan.color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-h3 text-neutral-900 dark:text-white mb-2">{plan.name}</h3>
                  <p className="text-body text-neutral-600 dark:text-neutral-400 mb-4">{plan.description}</p>
                  
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-neutral-900 dark:text-white">{plan.price}</span>
                    <span className="text-neutral-600 dark:text-neutral-400 ml-2">/{plan.period}</span>
                  </div>
                  
                  <Link href={plan.href}>
                    <Button 
                      className={`w-full ${plan.popular 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700' 
                        : ''
                      }`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {plan.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
                
                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <X className="w-5 h-5 text-neutral-400 flex-shrink-0" />
                      )}
                      <span className={`text-sm ${feature.included 
                        ? 'text-neutral-700 dark:text-neutral-300' 
                        : 'text-neutral-400 dark:text-neutral-500'
                      }`}>
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

      {/* Enterprise Section */}
      <section className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 py-24 rounded-2xl mx-6">
        <div className="max-w-4xl mx-auto text-center px-6">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-h1 text-neutral-900 dark:text-white mb-6">
            Enterprise Solutions
          </h2>
          <p className="text-body-large text-neutral-600 dark:text-neutral-400 mb-8 max-w-2xl mx-auto">
            Custom solutions for large teams and organizations. Get dedicated support, 
            advanced integrations, and tailored training programs.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[
              'Custom integrations',
              'Dedicated account manager',
              'On-premise deployment',
              'Advanced analytics',
              'Custom training programs',
              'SLA guarantees'
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2 justify-center">
                <Check className="w-5 h-5 text-green-500" />
                <span className="text-neutral-700 dark:text-neutral-300">{feature}</span>
              </div>
            ))}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="mailto:enterprise@promptopotamus.com">
              <Button size="lg" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                Contact Sales
              </Button>
            </Link>
            <Link href="/demo">
              <Button size="lg" variant="outline">
                Request Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-h1 text-neutral-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <p className="text-body-large text-neutral-600 dark:text-neutral-400">
            Got questions? We've got answers.
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
            Still have questions?
          </p>
          <Link href="mailto:support@promptopotamus.com">
            <Button variant="outline">
              Contact Support
            </Button>
          </Link>
        </div>
      </section>

      {/* Trust Section */}
      <section className="text-center py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 text-neutral-500 dark:text-neutral-400">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span>30-day money-back guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              <span>Cancel anytime</span>
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