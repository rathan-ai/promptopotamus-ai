'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { 
  MessageSquare, 
  X, 
  Send, 
  AlertTriangle, 
  Bug, 
  Lightbulb, 
  Zap,
  CheckCircle,
  User
} from 'lucide-react';
import toast from 'react-hot-toast';
import { createClient } from '@/lib/supabase/client';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface IssueReport {
  type: 'bug' | 'feature' | 'improvement' | 'other';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  page?: string;
  userAgent?: string;
}

export default function IssueReportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [formData, setFormData] = useState<IssueReport>({
    type: 'bug',
    title: '',
    description: '',
    priority: 'medium',
  });

  useEffect(() => {
    // Get current user for better reporting context
    const fetchUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();

    // Capture page info when widget loads
    setFormData(prev => ({
      ...prev,
      page: window.location.pathname,
      userAgent: navigator.userAgent
    }));
  }, []);

  const issueTypes = [
    { 
      id: 'bug', 
      label: 'Bug Report', 
      icon: Bug, 
      description: 'Something is broken or not working',
      color: 'text-slate-500',
      bgColor: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
    },
    { 
      id: 'feature', 
      label: 'Feature Request', 
      icon: Lightbulb, 
      description: 'Suggest a new feature',
      color: 'text-slate-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    },
    { 
      id: 'improvement', 
      label: 'Improvement', 
      icon: Zap, 
      description: 'Suggest an enhancement',
      color: 'text-emerald-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
    },
    { 
      id: 'other', 
      label: 'Other Issue', 
      icon: AlertTriangle, 
      description: 'General feedback or question',
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
    }
  ];

  const priorities = [
    { id: 'low', label: 'Low', color: 'text-gray-600' },
    { id: 'medium', label: 'Medium', color: 'text-yellow-600' },
    { id: 'high', label: 'High', color: 'text-slate-600' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Create subject line based on issue type and priority
      const priorityPrefix = formData.priority === 'high' ? '[URGENT] ' : 
                            formData.priority === 'medium' ? '[PRIORITY] ' : '';
      const typeLabel = issueTypes.find(t => t.id === formData.type)?.label || 'Issue';
      
      const subject = `${priorityPrefix}Promptopotamus ${typeLabel}: ${formData.title}`;
      
      // Create email body with context
      const emailBody = `
Issue Report from Promptopotamus Platform

Issue Type: ${typeLabel}
Priority: ${formData.priority.toUpperCase()}
Title: ${formData.title}

Description:
${formData.description}

Technical Details:
- Page: ${formData.page}
- User: ${user ? `${user.email} (${user.id})` : 'Anonymous'}
- Timestamp: ${new Date().toISOString()}
- User Agent: ${formData.userAgent}

---
This report was submitted via the Promptopotamus platform issue reporting system.
      `.trim();

      // Create mailto URL
      const mailtoUrl = `mailto:report@innorag.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody)}`;
      
      // Open email client
      window.open(mailtoUrl);
      
      // Show success message
      toast.success('Email client opened! Please send the pre-filled email to complete your report.');
      
      // Reset form and close modal
      setFormData({
        type: 'bug',
        title: '',
        description: '',
        priority: 'medium',
        page: window.location.pathname,
        userAgent: navigator.userAgent
      });
      setIsOpen(false);
      
    } catch (error) {
      console.error('Error creating issue report:', error);
      toast.error('Failed to create issue report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      // Floating Report Button
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-slate-600 hover:bg-indigo-700 text-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-label="Report an issue"
          title="Report an issue or share feedback"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
        
        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
          Report an issue
        </div>
      </div>
    );
  }

  const selectedType = issueTypes.find(t => t.id === formData.type);
  const SelectedIcon = selectedType?.icon || Bug;

  return (
    // Modal Overlay
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${selectedType?.bgColor || 'bg-gray-100'}`}>
              <SelectedIcon className={`w-5 h-5 ${selectedType?.color || 'text-gray-500'}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold dark:text-white">Report Issue</h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Help us improve Promptopotamus</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Issue Type Selection */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              What type of issue is this?
            </label>
            <div className="grid grid-cols-2 gap-3">
              {issueTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: type.id as any }))}
                    className={`p-3 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                      formData.type === type.id
                        ? type.bgColor + ' border-current'
                        : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-2 ${formData.type === type.id ? type.color : 'text-neutral-400'}`} />
                    <div className={`font-medium text-xs ${formData.type === type.id ? type.color : 'text-neutral-700 dark:text-neutral-300'}`}>
                      {type.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Priority Level
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-neutral-800 dark:text-white"
            >
              {priorities.map((priority) => (
                <option key={priority.id} value={priority.id}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Issue Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Brief summary of the issue..."
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-neutral-800 dark:text-white"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Detailed Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              placeholder="Please provide as much detail as possible about the issue, including steps to reproduce if applicable..."
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:bg-neutral-800 dark:text-white resize-none"
              required
            />
          </div>

          {/* User Context */}
          {user && (
            <div className="bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                <User className="w-4 h-4" />
                <span>Reporting as: {user.email}</span>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.title.trim() || !formData.description.trim()}
              className="flex-1 bg-slate-600 hover:bg-indigo-700"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Creating Report...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Report
                </>
              )}
            </Button>
          </div>

          {/* Footer Note */}
          <div className="text-xs text-neutral-500 dark:text-neutral-400 text-center pt-2 border-t border-neutral-200 dark:border-neutral-700">
            Reports are sent to report@innorag.com via your email client
          </div>
        </form>
      </div>
    </div>
  );
}