import Link from 'next/link';
import { Mail, Heart, ExternalLink, Shield } from 'lucide-react';
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
        { href: 'mailto:contact@innorag.com', label: 'Contact', internal: false },
      ]
    },
    {
      title: 'Support',
      links: [
        { href: '/help/promptcoins', label: 'PromptCoin Help', internal: true },
        { href: '/refund-policy', label: 'Refund Policy', internal: true },
        { href: 'mailto:contact@innorag.com', label: 'Contact Support', internal: false },
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
    <footer className="bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 mt-12">
      {/* Minimal Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Brand */}
          <div className="flex items-center gap-6">
            <Link href="/" className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
              Promptopotamus
            </Link>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Master AI prompting with certified Smart Prompts
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link href="/privacy-policy" className="text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Privacy
            </Link>
            <Link href="/terms-of-service" className="text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Terms
            </Link>
            <a href="mailto:contact@innorag.com" className="text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
              Support
            </a>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            © {currentYear} Promptopotamus. All rights reserved.
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Built by <a href="https://innorag.com" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">InnoRAG</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;