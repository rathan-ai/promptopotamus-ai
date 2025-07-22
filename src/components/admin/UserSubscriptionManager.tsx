'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Save, Crown, Star } from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
    id: string;
    full_name: string;
    email: string;
    subscription_tier?: string;
    subscription_status?: string;
    subscription_start_date?: string;
    subscription_end_date?: string;
}

interface UserSubscriptionManagerProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export default function UserSubscriptionManager({ 
    user, 
    isOpen, 
    onClose, 
    onUpdate 
}: UserSubscriptionManagerProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        subscription_tier: user.subscription_tier || 'free',
        subscription_status: user.subscription_status || 'inactive',
        subscription_start_date: user.subscription_start_date ? user.subscription_start_date.split('T')[0] : '',
        subscription_end_date: user.subscription_end_date ? user.subscription_end_date.split('T')[0] : '',
        payment_method: 'manual'
    });

    if (!isOpen) return null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/admin/subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    ...formData,
                    subscription_start_date: formData.subscription_start_date || null,
                    subscription_end_date: formData.subscription_end_date || null
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update subscription');
            }

            toast.success('Subscription updated successfully');
            onUpdate();
            onClose();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to update subscription');
        } finally {
            setIsSaving(false);
        }
    };

    const updateField = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const getTierIcon = (tier: string) => {
        switch (tier) {
            case 'pro': return <Star className="w-4 h-4" />;
            case 'premium': return <Crown className="w-4 h-4" />;
            default: return null;
        }
    };

    const getTierColor = (tier: string) => {
        switch (tier) {
            case 'premium': return 'border-purple-500 bg-purple-50 dark:bg-purple-900/20';
            case 'pro': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
            default: return 'border-gray-300 bg-gray-50 dark:bg-gray-900/20';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-2xl w-full shadow-2xl">
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                                Manage Subscription
                            </h2>
                            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                                {user.full_name || 'N/A'} ({user.email})
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Current Status */}
                    <div className="bg-neutral-50 dark:bg-neutral-700/50 rounded-lg p-4">
                        <h3 className="font-medium text-neutral-900 dark:text-white mb-2">Current Status</h3>
                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getTierColor(user.subscription_tier || 'free')}`}>
                                <div className="flex items-center gap-2">
                                    {getTierIcon(user.subscription_tier || 'free')}
                                    {user.subscription_tier || 'free'}
                                </div>
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                user.subscription_status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                                user.subscription_status === 'cancelled' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' :
                                user.subscription_status === 'expired' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300'
                            }`}>
                                {user.subscription_status || 'inactive'}
                            </span>
                        </div>
                    </div>

                    {/* Subscription Tier */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            Subscription Tier
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                            {['free', 'pro', 'premium'].map((tier) => (
                                <button
                                    key={tier}
                                    onClick={() => updateField('subscription_tier', tier)}
                                    className={`p-3 rounded-lg border-2 transition-all ${
                                        formData.subscription_tier === tier
                                            ? getTierColor(tier) + ' border-opacity-100'
                                            : 'border-neutral-200 dark:border-neutral-600 hover:border-neutral-300'
                                    }`}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        {getTierIcon(tier)}
                                        <span className="font-medium capitalize">{tier}</span>
                                    </div>
                                    <div className="text-xs text-neutral-500 mt-1">
                                        {tier === 'free' ? 'Basic features' :
                                         tier === 'pro' ? '$9/month' :
                                         '$19/month'}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Subscription Status */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            Subscription Status
                        </label>
                        <select
                            value={formData.subscription_status}
                            onChange={(e) => updateField('subscription_status', e.target.value)}
                            className="w-full rounded-lg border-neutral-300 dark:border-neutral-600 focus:border-indigo-500 focus:ring-indigo-500/50 bg-neutral-100 dark:bg-neutral-700 px-3 py-2"
                        >
                            <option value="inactive">Inactive</option>
                            <option value="active">Active</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="expired">Expired</option>
                        </select>
                    </div>

                    {/* Date Range */}
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={formData.subscription_start_date}
                                onChange={(e) => updateField('subscription_start_date', e.target.value)}
                                className="w-full rounded-lg border-neutral-300 dark:border-neutral-600 focus:border-indigo-500 focus:ring-indigo-500/50 bg-neutral-100 dark:bg-neutral-700 px-3 py-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={formData.subscription_end_date}
                                onChange={(e) => updateField('subscription_end_date', e.target.value)}
                                className="w-full rounded-lg border-neutral-300 dark:border-neutral-600 focus:border-indigo-500 focus:ring-indigo-500/50 bg-neutral-100 dark:bg-neutral-700 px-3 py-2"
                            />
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-3">Quick Actions</h4>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => {
                                    const today = new Date().toISOString().split('T')[0];
                                    const nextMonth = new Date();
                                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                                    const endDate = nextMonth.toISOString().split('T')[0];
                                    
                                    setFormData(prev => ({
                                        ...prev,
                                        subscription_tier: 'pro',
                                        subscription_status: 'active',
                                        subscription_start_date: today,
                                        subscription_end_date: endDate
                                    }));
                                }}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition-colors"
                            >
                                Activate Pro (1 month)
                            </button>
                            <button
                                onClick={() => {
                                    const today = new Date().toISOString().split('T')[0];
                                    const nextMonth = new Date();
                                    nextMonth.setMonth(nextMonth.getMonth() + 1);
                                    const endDate = nextMonth.toISOString().split('T')[0];
                                    
                                    setFormData(prev => ({
                                        ...prev,
                                        subscription_tier: 'premium',
                                        subscription_status: 'active',
                                        subscription_start_date: today,
                                        subscription_end_date: endDate
                                    }));
                                }}
                                className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full hover:bg-purple-700 transition-colors"
                            >
                                Activate Premium (1 month)
                            </button>
                            <button
                                onClick={() => {
                                    setFormData(prev => ({
                                        ...prev,
                                        subscription_tier: 'free',
                                        subscription_status: 'inactive',
                                        subscription_start_date: '',
                                        subscription_end_date: ''
                                    }));
                                }}
                                className="px-3 py-1 bg-gray-600 text-white text-xs rounded-full hover:bg-gray-700 transition-colors"
                            >
                                Reset to Free
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 flex gap-2 justify-end">
                    <Button onClick={onClose} variant="outline">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Update Subscription
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}