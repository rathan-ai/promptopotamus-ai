import { Metadata } from 'next';
import { FileText, Users, CreditCard, Shield, AlertTriangle, Gavel } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Terms of Service - Promptopotamus',
  description: 'Terms of Service for Promptopotamus AI prompt engineering platform.',
};

export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <FileText className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-display text-neutral-900 dark:text-white mb-4">
          Terms of Service
        </h1>
        <p className="text-body-large text-neutral-600 dark:text-neutral-400 max-w-2xl mx-auto">
          These terms govern your use of Promptopotamus and our services. Please read them carefully.
        </p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-4">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Content */}
      <div className="prose dark:prose-invert max-w-none">
        
        {/* Acceptance */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Gavel className="w-6 h-6 text-blue-600" />
            <h2 className="text-h2 text-neutral-900 dark:text-white mb-0">Acceptance of Terms</h2>
          </div>
          
          <p className="text-body text-neutral-600 dark:text-neutral-400">
            By accessing or using Promptopotamus ("Service"), you agree to be bound by these Terms of Service 
            ("Terms"). If you disagree with any part of these terms, you may not access the Service.
          </p>
        </section>

        {/* Service Description */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-emerald-600" />
            <h2 className="text-h2 text-neutral-900 dark:text-white mb-0">Service Description</h2>
          </div>
          
          <p className="text-body text-neutral-600 dark:text-neutral-400 mb-4">
            Promptopotamus is an AI prompt engineering platform that provides:
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
            <li>Educational content and tools for prompt engineering</li>
            <li>A marketplace for Smart Prompts and templates</li>
            <li>Professional certification programs</li>
            <li>Community features and resources</li>
          </ul>
        </section>

        {/* User Accounts */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-slate-600" />
            <h2 className="text-h2 text-neutral-900 dark:text-white mb-0">User Accounts</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-body text-neutral-600 dark:text-neutral-400">
              To access certain features, you must create an account. You are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and current information</li>
              <li>Notifying us immediately of any security breaches</li>
            </ul>
          </div>
        </section>

        {/* Payment Terms */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-6 h-6 text-slate-600" />
            <h2 className="text-h2 text-neutral-900 dark:text-white mb-0">Payment and Billing</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-h4 text-neutral-900 dark:text-white mb-3">PromptCoins</h3>
              <p className="text-body text-neutral-600 dark:text-neutral-400">
                Our platform uses a credit-based system called PromptCoins. By purchasing PromptCoins, you agree that:
              </p>
              <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400 mt-2">
                <li>All purchases are final and non-refundable</li>
                <li>PromptCoins have no cash value and cannot be transferred</li>
                <li>We may change pricing with notice</li>
                <li>Unused credits do not expire</li>
              </ul>
            </div>

            <div>
              <h3 className="text-h4 text-neutral-900 dark:text-white mb-3">Refund Policy</h3>
              <p className="text-body text-neutral-600 dark:text-neutral-400">
                All PromptCoin purchases are final. We do not offer refunds under any circumstances. 
                Please carefully consider your needs before making a purchase.
              </p>
            </div>
          </div>
        </section>

        {/* User Conduct */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <h2 className="text-h2 text-neutral-900 dark:text-white mb-0">User Conduct</h2>
          </div>
          
          <p className="text-body text-neutral-600 dark:text-neutral-400 mb-4">
            You agree not to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
            <li>Use the Service for any illegal or unauthorized purpose</li>
            <li>Violate any applicable laws or regulations</li>
            <li>Upload harmful, offensive, or inappropriate content</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with or disrupt the Service or servers</li>
            <li>Impersonate another person or entity</li>
            <li>Share your account credentials with others</li>
          </ul>
        </section>

        {/* Intellectual Property */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-indigo-600" />
            <h2 className="text-h2 text-neutral-900 dark:text-white mb-0">Intellectual Property</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-body text-neutral-600 dark:text-neutral-400">
              The Service and its original content, features, and functionality are owned by Innorag Technologies 
              Private Limited and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-body text-neutral-600 dark:text-neutral-400">
              Users retain ownership of content they create, but grant us a license to use, modify, and distribute 
              such content as necessary to provide the Service.
            </p>
          </div>
        </section>

        {/* Disclaimers */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-yellow-600" />
            <h2 className="text-h2 text-neutral-900 dark:text-white mb-0">Disclaimers</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-body text-neutral-600 dark:text-neutral-400">
              The Service is provided "as is" without warranties of any kind. We do not guarantee:
            </p>
            <ul className="list-disc list-inside space-y-2 text-neutral-600 dark:text-neutral-400">
              <li>Uninterrupted or error-free operation</li>
              <li>The accuracy or reliability of content</li>
              <li>That the Service will meet your requirements</li>
              <li>That defects will be corrected</li>
            </ul>
          </div>
        </section>

        {/* Limitation of Liability */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-slate-600" />
            <h2 className="text-h2 text-neutral-900 dark:text-white mb-0">Limitation of Liability</h2>
          </div>
          
          <p className="text-body text-neutral-600 dark:text-neutral-400">
            To the maximum extent permitted by law, Innorag Technologies Private Limited shall not be liable for 
            any indirect, incidental, special, consequential, or punitive damages, including but not limited to 
            loss of profits, data, or use, arising out of your use of the Service.
          </p>
        </section>

        {/* Termination */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-6 h-6 text-slate-600" />
            <h2 className="text-h2 text-neutral-900 dark:text-white mb-0">Termination</h2>
          </div>
          
          <p className="text-body text-neutral-600 dark:text-neutral-400">
            We may terminate or suspend your account and access to the Service immediately, without prior notice, 
            for any reason, including breach of these Terms. Upon termination, your right to use the Service will 
            cease immediately.
          </p>
        </section>

        {/* Governing Law */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Gavel className="w-6 h-6 text-blue-600" />
            <h2 className="text-h2 text-neutral-900 dark:text-white mb-0">Governing Law</h2>
          </div>
          
          <p className="text-body text-neutral-600 dark:text-neutral-400">
            These Terms shall be governed by and construed in accordance with the laws of India, without regard 
            to its conflict of law provisions. Any disputes shall be resolved in the courts of India.
          </p>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-emerald-600" />
            <h2 className="text-h2 text-neutral-900 dark:text-white mb-0">Contact Information</h2>
          </div>
          
          <p className="text-body text-neutral-600 dark:text-neutral-400">
            If you have any questions about these Terms of Service, please contact us at{' '}
            <a href="mailto:contact@innorag.com" className="text-blue-600 dark:text-blue-400 hover:underline">
              contact@innorag.com
            </a>
          </p>
        </section>

        {/* Changes */}
        <section className="border-t border-neutral-200 dark:border-neutral-700 pt-8">
          <h2 className="text-h3 text-neutral-900 dark:text-white mb-4">Changes to Terms</h2>
          <p className="text-body text-neutral-600 dark:text-neutral-400">
            We reserve the right to modify these Terms at any time. We will notify users of material changes by 
            posting the updated Terms on this page and updating the "Last updated" date. Your continued use of 
            the Service after changes constitutes acceptance of the new Terms.
          </p>
        </section>
      </div>
    </div>
  );
}