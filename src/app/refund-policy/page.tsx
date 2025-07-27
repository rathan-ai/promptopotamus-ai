import { Metadata } from 'next';
import { Shield, Clock, CheckCircle, AlertCircle, RefreshCw, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Refund Policy - Promptopotamus',
  description: 'Our comprehensive refund policy for PromptCoin purchases. 30-day money-back guarantee on unused credits.',
};

export default function RefundPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-display text-neutral-900 dark:text-white mb-4">
          Refund Policy
        </h1>
        <p className="text-body-large text-neutral-600 dark:text-neutral-400 leading-relaxed">
          We stand behind our PromptCoin system with a fair and transparent refund policy.
        </p>
      </div>

      {/* Quick Summary */}
      <div className="bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-700/50 p-6 mb-8">
        <div className="flex items-start gap-4">
          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
          <div>
            <h2 className="font-semibold text-green-900 dark:text-green-200 mb-2">30-Day Money-Back Guarantee</h2>
            <p className="text-green-800 dark:text-green-300">
              We offer a full refund on unused PromptCoins within 30 days of purchase. 
              No questions asked, no hassle.
            </p>
          </div>
        </div>
      </div>

      {/* Policy Details */}
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">Refund Eligibility</h2>
          <div className="space-y-4">
            <div className="p-4 bg-white dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700/50">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">✅ Eligible for Full Refund</h3>
              <ul className="text-neutral-600 dark:text-neutral-400 space-y-1">
                <li>• Unused PromptCoins within 30 days of purchase</li>
                <li>• Technical issues preventing use of purchased credits</li>
                <li>• Accidental duplicate purchases</li>
                <li>• Billing errors or unauthorized charges</li>
              </ul>
            </div>
            
            <div className="p-4 bg-white dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700/50">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">⚖️ Partial Refund Available</h3>
              <ul className="text-neutral-600 dark:text-neutral-400 space-y-1">
                <li>• Remaining unused PromptCoins after partial usage within 30 days</li>
                <li>• Service issues that affected your experience (case-by-case basis)</li>
              </ul>
            </div>

            <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-700/50">
              <h3 className="font-semibold text-orange-900 dark:text-orange-200 mb-2">❌ Not Eligible for Refund</h3>
              <ul className="text-orange-800 dark:text-orange-300 space-y-1">
                <li>• PromptCoins purchased more than 30 days ago</li>
                <li>• Credits used for completed services (analyses, enhancements, exports)</li>
                <li>• Smart Recipe purchases (digital goods policy)</li>
                <li>• Refund requests due to user error or misunderstanding of services</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">How Refunds Work</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-white">Contact Support</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">Email support@promptopotamus.com with your refund request</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-white">Review Process</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">We'll review your account and usage within 2 business days</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-white">Refund Processing</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">Approved refunds processed to original payment method in 3-5 business days</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700/50">
              <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Processing Times</h3>
              <ul className="text-blue-800 dark:text-blue-300 text-sm space-y-1">
                <li>• Credit Card: 3-5 business days</li>
                <li>• PayPal: 1-2 business days</li>
                <li>• Bank Transfer: 5-10 business days</li>
                <li>• Response Time: Within 24 hours</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">Special Circumstances</h2>
          <div className="space-y-4">
            <div className="p-4 bg-white dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700/50">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">Technical Issues</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                If you experience technical problems that prevent you from using purchased PromptCoins, 
                we'll provide a full refund regardless of usage, plus additional compensation if appropriate.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700/50">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">Unauthorized Purchases</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Report unauthorized charges immediately. We'll investigate and provide full refunds for 
                confirmed unauthorized transactions, plus help secure your account.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700/50">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">Service Dissatisfaction</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                While we can't refund used services, we're committed to making things right. 
                Contact us to discuss additional credits, service improvements, or other resolutions.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">What You Need to Provide</h2>
          <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-6">
            <h3 className="font-medium text-neutral-900 dark:text-white mb-3">For Faster Processing, Include:</h3>
            <ul className="text-neutral-600 dark:text-neutral-400 space-y-2">
              <li>• Your account email address</li>
              <li>• Transaction ID or purchase date</li>
              <li>• Reason for refund request</li>
              <li>• Any supporting screenshots or documentation</li>
              <li>• Preferred refund method (if different from original payment)</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">Dispute Resolution</h2>
          <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-700/50">
            <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 mb-3" />
            <p className="text-yellow-800 dark:text-yellow-300">
              If you're not satisfied with our refund decision, you can appeal by providing additional 
              information. We're committed to fair resolution and will escalate complex cases to senior management.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">Contact Information</h2>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6">
            <h3 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-3">Get Help With Refunds</h3>
            <div className="space-y-2 text-indigo-800 dark:text-indigo-300">
              <p>📧 Email: <a href="mailto:support@promptopotamus.com" className="underline">support@promptopotamus.com</a></p>
              <p>📧 Billing Issues: <a href="mailto:billing@promptopotamus.com" className="underline">billing@promptopotamus.com</a></p>
              <p>⏰ Response Time: Within 24 hours</p>
              <p>🕒 Business Hours: Monday-Friday, 9 AM - 6 PM EST</p>
            </div>
          </div>
        </section>
      </div>

      {/* Footer CTA */}
      <div className="mt-12 text-center">
        <div className="bg-gradient-to-r from-neutral-50 to-neutral-100 dark:from-neutral-800 dark:to-neutral-700 rounded-xl p-8">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-4">
            Questions About This Policy?
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 mb-6">
            We're here to help clarify any questions about refunds or PromptCoins.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="mailto:support@promptopotamus.com">
              <Button>
                Contact Support
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/help/promptcoins">
              <Button variant="outline">
                PromptCoin Help
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Policy Update Info */}
      <div className="mt-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
        <p>This policy was last updated on January 27, 2025.</p>
        <p>We may update this policy from time to time. Changes will be posted on this page.</p>
      </div>
    </div>
  );
}