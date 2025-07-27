import Link from 'next/link';
import { Mail, Heart, ExternalLink, Shield, FileText, HelpCircle, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/Button';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'Product',
      links: [
        { href: '/smart-prompts', label: 'Smart Prompts', internal: true },
        { href: '/templates', label: 'AI Templates', internal: true },
        { href: '/certificates', label: 'Get Certified', internal: true },
        { href: '/resources', label: 'Premium Tools', internal: true },
      ]
    },
    {
      title: 'Learn',
      links: [
        { href: '/#basic-techniques', label: 'Basic Techniques', internal: true },
        { href: '/#advanced-techniques', label: 'Advanced Techniques', internal: true },
        { href: '/#best-practices', label: 'Best Practices', internal: true },
        { href: '/#further-reading', label: 'Resources', internal: true },
      ]
    },
    {
      title: 'Company',
      links: [
        { href: '/about', label: 'About Us', internal: true },
        { href: '/pricing', label: 'Pricing', internal: true },
        { href: 'mailto:info@innorag.com', label: 'Contact', internal: false },
      ]
    },
    {
      title: 'Support',
      links: [
        { href: '/help/promptcoins', label: 'PromptCoin Help', internal: true },
        { href: '/refund-policy', label: 'Refund Policy', internal: true },
        { href: 'mailto:support@promptopotamus.com', label: 'Contact Support', internal: false },
      ]
    },
    {
      title: 'Legal',
      links: [
        { href: '/privacy-policy', label: 'Privacy Policy', internal: true },
        { href: '/terms-of-service', label: 'Terms of Service', internal: true },
      ]
    }
  ];


  return (
    <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 mt-24">
      {/* Newsletter Section */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
              Stay Updated with AI Prompt Tips
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Get weekly insights, new prompts, and exclusive tips delivered to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                <Mail className="w-4 h-4 mr-2" />
                Subscribe
              </Button>
            </form>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-3">
              No spam, unsubscribe anytime. By subscribing, you agree to our Privacy Policy.
            </p>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
              Promptopotamus
            </Link>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400 max-w-sm">
              Master the art of AI prompting with our comprehensive guides, tools, and certified Smart Prompts marketplace.
            </p>
            
            {/* Trust Badges */}
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <Shield className="w-4 h-4" />
                <span>SSL Secured</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <Heart className="w-4 h-4 text-red-500" />
                <span>Trusted by 10k+ Users</span>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {link.internal ? (
                      <Link
                        href={link.href}
                        className="text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors text-sm inline-flex items-center gap-1"
                      >
                        {link.label}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              © {currentYear} Promptopotamus. All rights reserved.
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
              Built by <a href="https://innorag.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">innorag.com</a>
            </p>
            
            {/* Quick Actions */}
            <div className="flex items-center gap-6">
              <Link
                href="/help"
                className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center gap-1"
              >
                <HelpCircle className="w-4 h-4" />
                Help Center
              </Link>
              <Link
                href="/docs"
                className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center gap-1"
              >
                <BookOpen className="w-4 h-4" />
                Documentation
              </Link>
              <a
                href="https://status.promptopotamus.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 inline-flex items-center gap-1"
              >
                <FileText className="w-4 h-4" />
                Status
              </a>
            </div>
          </div>

          {/* Fun Tagline */}
          <div className="mt-4 text-center">
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              🦛 Crafted with love and lots of prompts • Powered by creativity and caffeine
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;