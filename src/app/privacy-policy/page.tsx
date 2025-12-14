import { Metadata } from 'next';
import { Shield, Eye, Lock, Database, Cookie, Mail } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Privacy Policy - Promptopotamus',
  description: 'Privacy Policy for Promptopotamus AI prompt engineering platform.',
};

export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-display text-neutral-900 dark:text-white mb-4">
          Privacy Policy
        </h1>
        <p className="text-body-large text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information.
        </p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-4">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Content */}
      <div className="prose dark:prose-invert max-w-none">
        
        {/* Information We Collect */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Eye className="w-6 h-6 text-blue-600" />
            <h2 className="text-h2 text-neutral-900 dark:text-white mb-0">Information We Collect</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-h4 text-neutral-900 dark:text-white mb-3">Personal Information</h3>
              <p className="text-body text-neutral-600 dark:text-neutral-400 mb-4">
                We collect information you provide directly to us, such as:
              </p>
              <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
                <li>Email address and account credentials</li>
                <li>Profile information and preferences</li>
                <li>Payment information (processed securely by third-party providers)</li>
                <li>Communications with our support team</li>
              </ul>
            </div>

            <div>
              <h3 className="text-h4 text-neutral-900 dark:text-white mb-3">Usage Information</h3>
              <p className="text-body text-neutral-600 dark:text-neutral-400 mb-4">
                We automatically collect certain information about your use of our services:
              </p>
              <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
                <li>Device information and browser type</li>
                <li>IP address and location data</li>
                <li>Pages visited and features used</li>
                <li>Usage patterns and preferences</li>
              </ul>
            </div>
          </div>
        </section>

        {/* How We Use Information */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-6 h-6 text-emerald-600" />
            <h2 className="text-h2 text-neutral-900 dark:text-white mb-0">How We Use Your Information</h2>
          </div>
          
          <p className="text-body text-neutral-600 dark:text-neutral-400 mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
            <li>Provide and maintain our services</li>
            <li>Process payments and transactions</li>
            <li>Communicate with you about your account</li>
            <li>Improve our platform and user experience</li>
            <li>Ensure security and prevent fraud</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        {/* Information Sharing */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-slate-600" />
            <h2 className="text-h2 text-neutral-900 dark:text-white mb-0">Information Sharing</h2>
          </div>
          
          <p className="text-body text-neutral-600 dark:text-neutral-400 mb-4">
            We do not sell or rent your personal information to third parties. We may share information in limited circumstances:
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
            <li>With service providers who help us operate our platform</li>
            <li>To comply with legal requirements or protect our rights</li>
            <li>In connection with a business transfer or merger</li>
            <li>With your consent or at your direction</li>
          </ul>
        </section>

        {/* Data Security */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-slate-600" />
            <h2 className="text-h2 text-neutral-900 dark:text-white mb-0">Data Security</h2>
          </div>
          
          <p className="text-body text-neutral-600 dark:text-neutral-400">
            We implement appropriate technical and organizational measures to protect your personal information against 
            unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the 
            internet is 100% secure, and we cannot guarantee absolute security.
          </p>
        </section>

        {/* Cookies */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Cookie className="w-6 h-6 text-orange-600" />
            <h2 className="text-h2 text-neutral-900 dark:text-white mb-0">Cookies and Tracking</h2>
          </div>
          
          <p className="text-body text-neutral-600 dark:text-neutral-400">
            We use cookies and similar technologies to enhance your experience, analyze usage patterns, and 
            provide personalized content. You can control cookie preferences through your browser settings.
          </p>
        </section>

        {/* Your Rights */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Eye className="w-6 h-6 text-indigo-600" />
            <h2 className="text-h2 text-neutral-900 dark:text-white mb-0">Your Rights</h2>
          </div>
          
          <p className="text-body text-neutral-600 dark:text-neutral-400 mb-4">
            You have the right to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
            <li>Access and update your personal information</li>
            <li>Delete your account and associated data</li>
            <li>Opt out of marketing communications</li>
            <li>Request a copy of your data</li>
            <li>Contact us with privacy concerns</li>
          </ul>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-6 h-6 text-blue-600" />
            <h2 className="text-h2 text-neutral-900 dark:text-white mb-0">Contact Us</h2>
          </div>
          
          <p className="text-body text-neutral-600 dark:text-neutral-400">
            If you have any questions about this Privacy Policy or our privacy practices, please contact us at{' '}
            <a href="mailto:contact@innorag.com" className="text-blue-600 dark:text-blue-400 hover:underline">
              contact@innorag.com
            </a>
          </p>
        </section>

        {/* Updates */}
        <section className="border-t border-neutral-200 dark:border-neutral-700 pt-8">
          <h2 className="text-h3 text-neutral-900 dark:text-white mb-4">Policy Updates</h2>
          <p className="text-body text-neutral-600 dark:text-neutral-400">
            We may update this Privacy Policy from time to time. We will notify you of any material changes by 
            posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
          </p>
        </section>
      </div>
    </div>
  );
}