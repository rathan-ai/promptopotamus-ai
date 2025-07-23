'use client';

import { useState, useEffect } from 'react';
import { 
  Save, 
  RefreshCw, 
  DollarSign, 
  Zap, 
  Brain, 
  Settings as SettingsIcon, 
  Users, 
  CreditCard,
  Mail,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface AdminSettings {
  subscription: {
    free_tier_price: number;
    pro_tier_price: number;
    premium_tier_price: number;
  };
  limits: {
    prompt_builder_free_daily: number;
    prompt_analyzer_free_daily: number;
    prompt_builder_pro_daily: number;
    prompt_analyzer_pro_daily: number;
    prompt_builder_premium_daily: number;
    prompt_analyzer_premium_daily: number;
  };
  smart_prompts: {
    max_free_prompts_personal: number;
    default_commission_rate: number;
    pro_commission_rate: number;
    premium_commission_rate: number;
    allow_user_pricing: boolean;
    min_price: number;
    max_price: number;
  };
  certification: {
    free_attempts_per_level: number;
    attempt_cooldown_days: number;
    certificate_validity_months: number;
    failure_cascade_threshold: number;
  };
  features: {
    marketplace_enabled: boolean;
    reviews_enabled: boolean;
    social_features_enabled: boolean;
    analytics_enabled: boolean;
  };
  payments: {
    payment_provider: string;
    currency: string;
    processing_fee: number;
    // PayPal credentials
    paypal_client_id: string;
    paypal_client_secret: string;
    paypal_environment: string;
    // Stripe credentials
    stripe_publishable_key: string;
    stripe_secret_key: string;
    // Razorpay credentials
    razorpay_key_id: string;
    razorpay_key_secret: string;
    // Square credentials
    square_application_id: string;
    square_access_token: string;
    // Custom API credentials
    custom_api_endpoint: string;
    custom_api_key: string;
  };
  communication: {
    support_email: string;
    company_name: string;
    platform_name: string;
  };
}

type SettingsCategory = keyof AdminSettings;

export default function SettingsManager() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null); // Track which setting is being saved
  const [usingFallback, setUsingFallback] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    subscription: false,
    limits: false,
    smart_prompts: false,
    certification: false,
    features: false,
    payments: false,
    communication: false,
  });

  const fetchSettings = async () => {
    setLoading(true);
    setUsingFallback(false);
    try {
      const response = await fetch('/api/admin/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data.settings);
        setUsingFallback(false);
        toast.success('Admin settings loaded successfully');
      } else {
        // Get the error details
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Admin API error:', response.status, errorData);
        
        if (response.status === 401 || response.status === 403) {
          toast.error(`Admin access denied: ${errorData.error || 'Please ensure you have admin role'}`);
          setUsingFallback(true);
        } else {
          // Fallback to public settings for other errors (like table not existing)
          const publicResponse = await fetch('/api/public/settings');
          if (publicResponse.ok) {
            const publicData = await publicResponse.json();
            setSettings(publicData.settings);
            setUsingFallback(true);
            toast.error(`Admin API error (${response.status}): ${errorData.error || 'Unknown error'}`);
          } else {
            throw new Error('Failed to fetch settings from both admin and public APIs');
          }
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setUsingFallback(true);
      toast.error('Failed to load settings. Please check console for details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSetting = async (category: string, key: string, value: any) => {
    setSaving(`${category}.${key}`);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, key, value })
      });

      if (response.ok) {
        toast.success('Setting updated successfully');
        // Update local state
        if (settings) {
          setSettings({
            ...settings,
            [category]: {
              ...settings[category as SettingsCategory],
              [key]: value
            }
          });
        }
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update setting');
      }
    } catch (error) {
      console.error('Error updating setting:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update setting');
    } finally {
      setSaving(null);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderNumberInput = (category: string, key: string, value: number, description: string, step = 1, min = 0, max?: number) => (
    <div className="border border-neutral-200 dark:border-neutral-600 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <label className="block text-sm font-medium dark:text-white">
            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </label>
          <p className="text-xs text-neutral-500 mt-1">{description}</p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            const input = document.getElementById(`${category}-${key}`) as HTMLInputElement;
            if (input) {
              const newValue = parseFloat(input.value);
              if (!isNaN(newValue)) {
                updateSetting(category, key, newValue);
              }
            }
          }}
          disabled={saving === `${category}.${key}` || usingFallback}
          className="ml-2"
        >
          {saving === `${category}.${key}` ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <Save className="w-3 h-3" />
          )}
        </Button>
      </div>
      <input
        id={`${category}-${key}`}
        type="number"
        step={step}
        min={min}
        max={max}
        defaultValue={value}
        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
      />
    </div>
  );

  const renderPasswordInput = (category: string, key: string, value: string, description: string) => (
    <div className="border border-neutral-200 dark:border-neutral-600 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <label className="block text-sm font-medium dark:text-white">
            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </label>
          <p className="text-xs text-neutral-500 mt-1">{description}</p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            const input = document.getElementById(`${category}-${key}`) as HTMLInputElement;
            if (input) {
              updateSetting(category, key, input.value);
            }
          }}
          disabled={saving === `${category}.${key}` || usingFallback}
          className="ml-2"
        >
          {saving === `${category}.${key}` ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <Save className="w-3 h-3" />
          )}
        </Button>
      </div>
      <input
        id={`${category}-${key}`}
        type="password"
        defaultValue={value}
        placeholder={`Enter ${key.replace(/_/g, ' ')}`}
        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
      />
    </div>
  );

  const renderSelectInput = (category: string, key: string, value: string, description: string, options: { value: string; label: string }[]) => (
    <div className="border border-neutral-200 dark:border-neutral-600 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <label className="block text-sm font-medium dark:text-white">
            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </label>
          <p className="text-xs text-neutral-500 mt-1">{description}</p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            const select = document.getElementById(`${category}-${key}`) as HTMLSelectElement;
            if (select) {
              updateSetting(category, key, select.value);
            }
          }}
          disabled={saving === `${category}.${key}` || usingFallback}
          className="ml-2"
        >
          {saving === `${category}.${key}` ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <Save className="w-3 h-3" />
          )}
        </Button>
      </div>
      <select
        id={`${category}-${key}`}
        defaultValue={value}
        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const renderTextInput = (category: string, key: string, value: string, description: string) => (
    <div className="border border-neutral-200 dark:border-neutral-600 rounded-lg p-4">
      <div className="flex justify-between items-start mb-2">
        <div>
          <label className="block text-sm font-medium dark:text-white">
            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </label>
          <p className="text-xs text-neutral-500 mt-1">{description}</p>
        </div>
        <Button
          size="sm"
          onClick={() => {
            const input = document.getElementById(`${category}-${key}`) as HTMLInputElement;
            if (input) {
              updateSetting(category, key, input.value);
            }
          }}
          disabled={saving === `${category}.${key}` || usingFallback}
          className="ml-2"
        >
          {saving === `${category}.${key}` ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <Save className="w-3 h-3" />
          )}
        </Button>
      </div>
      <input
        id={`${category}-${key}`}
        type="text"
        defaultValue={value}
        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-neutral-700 dark:text-white"
      />
    </div>
  );

  const renderBooleanInput = (category: string, key: string, value: boolean, description: string) => (
    <div className="border border-neutral-200 dark:border-neutral-600 rounded-lg p-4">
      <div className="flex justify-between items-center">
        <div>
          <label className="block text-sm font-medium dark:text-white">
            {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </label>
          <p className="text-xs text-neutral-500 mt-1">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              defaultChecked={value}
              onChange={(e) => updateSetting(category, key, e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-neutral-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-neutral-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 dark:text-red-400">Failed to load settings</p>
        <Button onClick={fetchSettings} className="mt-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const sections = [
    {
      key: 'subscription',
      title: 'Subscription Pricing',
      icon: DollarSign,
      description: 'Manage subscription tier pricing',
      color: 'text-green-600'
    },
    {
      key: 'limits',
      title: 'Usage Limits',
      icon: Zap,
      description: 'Configure daily usage limits for tools',
      color: 'text-blue-600'
    },
    {
      key: 'smart_prompts',
      title: 'Smart Prompts',
      icon: Brain,
      description: 'Marketplace and pricing settings',
      color: 'text-purple-600'
    },
    {
      key: 'certification',
      title: 'Certification',
      icon: Users,
      description: 'Certificate and quiz attempt settings',
      color: 'text-orange-600'
    },
    {
      key: 'features',
      title: 'Feature Toggles',
      icon: SettingsIcon,
      description: 'Enable/disable platform features',
      color: 'text-indigo-600'
    },
    {
      key: 'payments',
      title: 'Payment Settings',
      icon: CreditCard,
      description: 'Payment provider and currency settings',
      color: 'text-pink-600'
    },
    {
      key: 'communication',
      title: 'Communication',
      icon: Mail,
      description: 'Company information and contact details',
      color: 'text-teal-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold dark:text-white">Platform Settings</h2>
        <Button onClick={fetchSettings} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Warning Banner - Show when using fallback settings */}
      {usingFallback && settings && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            <div>
              <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">Admin Access Issue</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                Unable to load admin settings. Settings are read-only. Check browser console for details.
              </p>
              <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-2 space-y-1">
                <p>Possible issues:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Admin role not properly set in profiles table</li>
                  <li>Database policies need update: run <code className="bg-yellow-100 dark:bg-yellow-800 px-1 rounded">update-admin-policies.sql</code></li>
                  <li>Authentication session issue (try refresh/re-login)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Success Banner - Show when admin settings loaded */}
      {!usingFallback && settings && (
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
            <div>
              <h3 className="font-semibold text-green-800 dark:text-green-200">Admin Settings Active</h3>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                You have admin access and can modify platform settings. Changes are saved to the database.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {sections.map((section) => {
          const Icon = section.icon;
          const isExpanded = expandedSections[section.key];
          const sectionData = settings[section.key as SettingsCategory];

          return (
            <div key={section.key} className="bg-white dark:bg-neutral-800 rounded-lg shadow border border-neutral-200 dark:border-neutral-700">
              <button
                onClick={() => toggleSection(section.key)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${section.color}`} />
                  <div className="text-left">
                    <h3 className="font-semibold dark:text-white">{section.title}</h3>
                    <p className="text-sm text-neutral-500">{section.description}</p>
                  </div>
                </div>
                <div className="text-neutral-400">
                  {isExpanded ? '−' : '+'}
                </div>
              </button>

              {isExpanded && (
                <div className="px-6 pb-6 border-t border-neutral-200 dark:border-neutral-700">
                  <div className="grid gap-4 mt-4">
                    {section.key === 'subscription' && (
                      <>
                        {renderNumberInput('subscription', 'free_tier_price', settings.subscription.free_tier_price, 'Price for Free tier subscription', 0.01)}
                        {renderNumberInput('subscription', 'pro_tier_price', settings.subscription.pro_tier_price, 'Price for Pro tier subscription', 0.01)}
                        {renderNumberInput('subscription', 'premium_tier_price', settings.subscription.premium_tier_price, 'Price for Premium tier subscription', 0.01)}
                      </>
                    )}

                    {section.key === 'limits' && (
                      <>
                        {renderNumberInput('limits', 'prompt_builder_free_daily', settings.limits.prompt_builder_free_daily, 'Daily AI enhancements for free users in Prompt Builder')}
                        {renderNumberInput('limits', 'prompt_analyzer_free_daily', settings.limits.prompt_analyzer_free_daily, 'Daily analyses for free users in Prompt Analyzer')}
                        {renderNumberInput('limits', 'prompt_builder_pro_daily', settings.limits.prompt_builder_pro_daily, 'Daily AI enhancements for Pro users (-1 = unlimited)', 1, -1)}
                        {renderNumberInput('limits', 'prompt_analyzer_pro_daily', settings.limits.prompt_analyzer_pro_daily, 'Daily analyses for Pro users (-1 = unlimited)', 1, -1)}
                        {renderNumberInput('limits', 'prompt_builder_premium_daily', settings.limits.prompt_builder_premium_daily, 'Daily AI enhancements for Premium users (-1 = unlimited)', 1, -1)}
                        {renderNumberInput('limits', 'prompt_analyzer_premium_daily', settings.limits.prompt_analyzer_premium_daily, 'Daily analyses for Premium users (-1 = unlimited)', 1, -1)}
                      </>
                    )}

                    {section.key === 'smart_prompts' && (
                      <>
                        {renderNumberInput('smart_prompts', 'max_free_prompts_personal', settings.smart_prompts.max_free_prompts_personal, 'Maximum personal prompts for non-certified users')}
                        {renderNumberInput('smart_prompts', 'default_commission_rate', settings.smart_prompts.default_commission_rate, 'Default platform commission rate (0.20 = 20%)', 0.01, 0, 1)}
                        {renderNumberInput('smart_prompts', 'pro_commission_rate', settings.smart_prompts.pro_commission_rate, 'Commission rate for Pro subscription sellers', 0.01, 0, 1)}
                        {renderNumberInput('smart_prompts', 'premium_commission_rate', settings.smart_prompts.premium_commission_rate, 'Commission rate for Premium subscription sellers', 0.01, 0, 1)}
                        {renderBooleanInput('smart_prompts', 'allow_user_pricing', settings.smart_prompts.allow_user_pricing, 'Allow users to set their own Smart Prompt prices')}
                        {renderNumberInput('smart_prompts', 'min_price', settings.smart_prompts.min_price, 'Minimum price for paid Smart Prompts', 0.01)}
                        {renderNumberInput('smart_prompts', 'max_price', settings.smart_prompts.max_price, 'Maximum price for paid Smart Prompts', 0.01)}
                      </>
                    )}

                    {section.key === 'certification' && (
                      <>
                        {renderNumberInput('certification', 'free_attempts_per_level', settings.certification.free_attempts_per_level, 'Free certification attempts per level')}
                        {renderNumberInput('certification', 'attempt_cooldown_days', settings.certification.attempt_cooldown_days, 'Cooldown period after exhausting attempts (days)')}
                        {renderNumberInput('certification', 'certificate_validity_months', settings.certification.certificate_validity_months, 'Certificate validity period in months')}
                        {renderNumberInput('certification', 'failure_cascade_threshold', settings.certification.failure_cascade_threshold, 'Consecutive failures to drop level')}
                      </>
                    )}

                    {section.key === 'features' && (
                      <>
                        {renderBooleanInput('features', 'marketplace_enabled', settings.features.marketplace_enabled, 'Enable Smart Prompts marketplace')}
                        {renderBooleanInput('features', 'reviews_enabled', settings.features.reviews_enabled, 'Enable prompt reviews and ratings')}
                        {renderBooleanInput('features', 'social_features_enabled', settings.features.social_features_enabled, 'Enable social features (following, sharing)')}
                        {renderBooleanInput('features', 'analytics_enabled', settings.features.analytics_enabled, 'Enable platform analytics tracking')}
                      </>
                    )}

                    {section.key === 'payments' && (
                      <>
                        {renderSelectInput('payments', 'payment_provider', settings.payments.payment_provider, 'Primary payment provider for the platform', [
                          { value: 'stripe', label: 'Stripe' },
                          { value: 'paypal', label: 'PayPal' },
                          { value: 'razorpay', label: 'Razorpay' },
                          { value: 'square', label: 'Square' },
                          { value: 'custom', label: 'Custom API' }
                        ])}
                        {renderTextInput('payments', 'currency', settings.payments.currency, 'Platform currency (USD, EUR, etc.)')}
                        {renderNumberInput('payments', 'processing_fee', settings.payments.processing_fee, 'Payment processing fee rate (0.029 = 2.9%)', 0.001, 0, 1)}
                        
                        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">PayPal Configuration</h4>
                          <div className="space-y-4">
                            {renderTextInput('payments', 'paypal_client_id', settings.payments.paypal_client_id, 'PayPal Client ID from developer dashboard')}
                            {renderPasswordInput('payments', 'paypal_client_secret', settings.payments.paypal_client_secret, 'PayPal Client Secret (keep secure)')}
                            {renderSelectInput('payments', 'paypal_environment', settings.payments.paypal_environment, 'PayPal environment for transactions', [
                              { value: 'sandbox', label: 'Sandbox (Testing)' },
                              { value: 'live', label: 'Live (Production)' }
                            ])}
                          </div>
                        </div>

                        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-3">Stripe Configuration</h4>
                          <div className="space-y-4">
                            {renderTextInput('payments', 'stripe_publishable_key', settings.payments.stripe_publishable_key, 'Stripe Publishable Key (starts with pk_)')}
                            {renderPasswordInput('payments', 'stripe_secret_key', settings.payments.stripe_secret_key, 'Stripe Secret Key (starts with sk_) - keep secure')}
                          </div>
                        </div>

                        <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                          <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-3">Razorpay Configuration</h4>
                          <div className="space-y-4">
                            {renderTextInput('payments', 'razorpay_key_id', settings.payments.razorpay_key_id, 'Razorpay Key ID from dashboard')}
                            {renderPasswordInput('payments', 'razorpay_key_secret', settings.payments.razorpay_key_secret, 'Razorpay Key Secret - keep secure')}
                          </div>
                        </div>

                        <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                          <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-3">Square Configuration</h4>
                          <div className="space-y-4">
                            {renderTextInput('payments', 'square_application_id', settings.payments.square_application_id, 'Square Application ID from developer console')}
                            {renderPasswordInput('payments', 'square_access_token', settings.payments.square_access_token, 'Square Access Token - keep secure')}
                          </div>
                        </div>

                        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-800">
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Custom API Configuration</h4>
                          <div className="space-y-4">
                            {renderTextInput('payments', 'custom_api_endpoint', settings.payments.custom_api_endpoint, 'Custom payment API endpoint URL')}
                            {renderPasswordInput('payments', 'custom_api_key', settings.payments.custom_api_key, 'Custom API authentication key - keep secure')}
                          </div>
                        </div>
                      </>
                    )}

                    {section.key === 'communication' && (
                      <>
                        {renderTextInput('communication', 'support_email', settings.communication.support_email, 'Platform support email address')}
                        {renderTextInput('communication', 'company_name', settings.communication.company_name, 'Company name for certificates and legal')}
                        {renderTextInput('communication', 'platform_name', settings.communication.platform_name, 'Platform display name')}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}