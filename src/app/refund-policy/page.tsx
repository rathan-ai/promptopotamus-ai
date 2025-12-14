import { Metadata } from 'next';
import { Shield, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export const metadata: Metadata = {
  title: 'Refund Policy - Promptopotamus',
  description: 'Our refund policy for digital purchases. All digital product purchases are final and non-refundable.',
};

export default function RefundPolicy() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-display text-neutral-900 dark:text-white mb-4">
          Refund Policy
        </h1>
        <p className="text-body-large text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Our clear and transparent policy regarding purchases and usage.
        </p>
      </div>

      {/* Quick Summary */}
      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-700/50 p-6 mb-8">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-slate-600 dark:text-red-400 flex-shrink-0 mt-1" />
          <div>
            <h2 className="font-semibold text-red-900 dark:text-red-200 mb-2">No Refunds Policy</h2>
            <p className="text-red-800 dark:text-red-300">
              All digital product purchases are final and non-refundable. Please carefully consider your needs before purchasing.
            </p>
          </div>
        </div>
      </div>

      {/* Policy Details */}
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">Policy Details</h2>
          <div className="space-y-4">
            <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700/50">
              <h3 className="font-semibold text-red-900 dark:text-red-200 mb-2">No Refunds Available</h3>
              <ul className="text-red-800 dark:text-red-300 space-y-1">
                <li>• All digital product purchases are final and non-refundable</li>
                <li>• Smart Recipe and template purchases (digital goods policy)</li>
                <li>• Exam and certification fees</li>
              </ul>
            </div>

            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700/50">
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">Exception Cases</h3>
              <ul className="text-yellow-800 dark:text-yellow-300 space-y-1">
                <li>• Technical issues preventing use of purchased products (case-by-case evaluation)</li>
                <li>• Billing errors or unauthorized charges (full investigation required)</li>
                <li>• Accidental duplicate purchases (immediate contact required)</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">How to Report Issues</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">1</span>
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-white">Contact Support</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">Email contact@innorag.com with detailed issue description</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">2</span>
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-white">Investigation</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">We&apos;ll investigate technical or billing issues within 2 business days</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-sm">3</span>
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-white">Resolution</h3>
                  <p className="text-neutral-600 dark:text-neutral-400 text-sm">Appropriate resolution provided based on findings and circumstances</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700/50">
              <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
              <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">Response Times</h3>
              <ul className="text-blue-800 dark:text-blue-300 text-sm space-y-1">
                <li>• Initial Response: Within 24 hours</li>
                <li>• Technical Issues: 1-3 business days</li>
                <li>• Billing Disputes: 2-5 business days</li>
                <li>• Complex Cases: Up to 10 business days</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">Important Information</h2>
          <div className="space-y-4">
            <div className="p-4 bg-white dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700/50">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">Digital Products</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Our platform offers digital products including Smart Recipes, templates, and certification exams.
                Once purchased, these products are immediately accessible in your account.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700/50">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">Purchase Consideration</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Since all purchases are final, please carefully review product details and pricing
                before making a purchase. Preview options are available for many products.
              </p>
            </div>

            <div className="p-4 bg-white dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-700/50">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">Account Security</h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Keep your account secure and report any unauthorized activity immediately.
                We take security seriously and will investigate any suspicious transactions.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">When Contacting Support</h2>
          <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-lg p-6">
            <h3 className="font-medium text-neutral-900 dark:text-white mb-3">Please Include:</h3>
            <ul className="text-neutral-600 dark:text-neutral-400 space-y-2">
              <li>• Your account email address</li>
              <li>• Transaction ID or purchase date</li>
              <li>• Detailed description of the issue</li>
              <li>• Any supporting screenshots or documentation</li>
              <li>• Steps you&apos;ve already tried to resolve the issue</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">Contact Information</h2>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6">
            <h3 className="font-semibold text-indigo-900 dark:text-indigo-200 mb-3">Get Help With Issues</h3>
            <div className="space-y-2 text-indigo-800 dark:text-indigo-300">
              <p>Email: <a href="mailto:contact@innorag.com" className="underline">contact@innorag.com</a></p>
              <p>Billing Issues: <a href="mailto:contact@innorag.com" className="underline">contact@innorag.com</a></p>
              <p>Response Time: Within 24 hours</p>
              <p>Business Hours: Monday-Friday, 9 AM - 6 PM EST</p>
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
            We&apos;re here to help clarify any questions about this policy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="mailto:contact@innorag.com">
              <Button>
                Contact Support
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link href="/guides">
              <Button variant="outline">
                View Guides
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Policy Update Info */}
      <div className="mt-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
        <p>This policy was last updated on December 14, 2025.</p>
        <p>We may update this policy from time to time. Changes will be posted on this page.</p>
      </div>
    </div>
  );
}
