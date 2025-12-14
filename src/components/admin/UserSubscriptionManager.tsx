'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Save, Coins, Plus, Minus } from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
    id: string;
    full_name: string;
    email: string;
    credits_analysis?: number;
    credits_enhancement?: number;
    credits_exam?: number;
    credits_export?: number;
    payment_status?: string;
}

interface UserCreditManagerProps {
    user: User;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

export default function UserCreditManager({ 
    user, 
    isOpen, 
    onClose, 
    onUpdate 
}: UserCreditManagerProps) {
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        credits_analysis: user.credits_analysis || 0,
        credits_enhancement: user.credits_enhancement || 0,
        credits_exam: user.credits_exam || 0,
        credits_export: user.credits_export || 0,
        payment_status: user.payment_status || 'none'
    });

    if (!isOpen) return null;

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const response = await fetch('/api/admin/credits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    ...formData
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update credits');
            }

            toast.success('Credits updated successfully');
            onUpdate();
            onClose();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to update credits');
        } finally {
            setIsSaving(false);
        }
    };

    const updateField = (field: string, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const adjustCredits = (field: string, amount: number) => {
        setFormData(prev => ({
            ...prev,
            [field]: Math.max(0, (prev[field as keyof typeof prev] as number) + amount)
        }));
    };

    const getTotalCredits = () => {
        return formData.credits_analysis + formData.credits_enhancement + formData.credits_exam + formData.credits_export;
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-2xl w-full shadow-2xl">
                <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                                Manage Credits
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
                        <h3 className="font-medium text-neutral-900 dark:text-white mb-2">Current Balance</h3>
                        <div className="flex items-center gap-4">
                            <span className="px-3 py-1 rounded-full text-sm font-medium border border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                                <div className="flex items-center gap-2">
                                    <Coins className="w-4 h-4" />
                                    {getTotalCredits()} Credits Total
                                </div>
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                user.payment_status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                                'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300'
                            }`}>
                                {user.payment_status === 'active' ? 'Paid User' : 'Free User'}
                            </span>
                        </div>
                    </div>

                    {/* Feature Credits */}
                    <div className="space-y-4">
                        <h3 className="font-medium text-neutral-900 dark:text-white">Credit Balances</h3>
                        
                        {/* Analysis Credits */}
                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-emerald-700 dark:text-green-300">
                                    Analysis Credits
                                </label>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => adjustCredits('credits_analysis', -10)}
                                        className="p-1 bg-slate-500 text-white rounded hover:bg-slate-600"
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="font-mono text-lg w-16 text-center">{formData.credits_analysis}</span>
                                    <button
                                        onClick={() => adjustCredits('credits_analysis', 10)}
                                        className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-600"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                            <input
                                type="number"
                                value={formData.credits_analysis}
                                onChange={(e) => updateField('credits_analysis', parseInt(e.target.value) || 0)}
                                className="w-full rounded-lg border-green-300 dark:border-emerald-600 focus:border-emerald-600 focus:ring-emerald-600/50 bg-white dark:bg-neutral-800 px-3 py-2"
                                min="0"
                            />
                        </div>

                        {/* Enhancement Credits */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                    Enhancement Credits
                                </label>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => adjustCredits('credits_enhancement', -15)}
                                        className="p-1 bg-slate-500 text-white rounded hover:bg-slate-600"
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="font-mono text-lg w-16 text-center">{formData.credits_enhancement}</span>
                                    <button
                                        onClick={() => adjustCredits('credits_enhancement', 15)}
                                        className="p-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                            <input
                                type="number"
                                value={formData.credits_enhancement}
                                onChange={(e) => updateField('credits_enhancement', parseInt(e.target.value) || 0)}
                                className="w-full rounded-lg border-blue-300 dark:border-blue-600 focus:border-blue-500 focus:ring-blue-500/50 bg-white dark:bg-neutral-800 px-3 py-2"
                                min="0"
                            />
                        </div>

                        {/* Exam Credits */}
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                                    Exam Credits
                                </label>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => adjustCredits('credits_exam', -50)}
                                        className="p-1 bg-slate-500 text-white rounded hover:bg-slate-600"
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="font-mono text-lg w-16 text-center">{formData.credits_exam}</span>
                                    <button
                                        onClick={() => adjustCredits('credits_exam', 50)}
                                        className="p-1 bg-slate-500 text-white rounded hover:bg-yellow-600"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                            <input
                                type="number"
                                value={formData.credits_exam}
                                onChange={(e) => updateField('credits_exam', parseInt(e.target.value) || 0)}
                                className="w-full rounded-lg border-yellow-300 dark:border-yellow-600 focus:border-slate-500 focus:ring-slate-500/50 bg-white dark:bg-neutral-800 px-3 py-2"
                                min="0"
                            />
                        </div>

                        {/* Export Credits */}
                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium text-purple-700 dark:text-purple-300">
                                    Export Credits
                                </label>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => adjustCredits('credits_export', -5)}
                                        className="p-1 bg-slate-500 text-white rounded hover:bg-slate-600"
                                    >
                                        <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="font-mono text-lg w-16 text-center">{formData.credits_export}</span>
                                    <button
                                        onClick={() => adjustCredits('credits_export', 5)}
                                        className="p-1 bg-slate-500 text-white rounded hover:bg-slate-600"
                                    >
                                        <Plus className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                            <input
                                type="number"
                                value={formData.credits_export}
                                onChange={(e) => updateField('credits_export', parseInt(e.target.value) || 0)}
                                className="w-full rounded-lg border-purple-300 dark:border-slate-600 focus:border-slate-500 focus:ring-slate-500/50 bg-white dark:bg-neutral-800 px-3 py-2"
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Payment Status */}
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                            Payment Status
                        </label>
                        <select
                            value={formData.payment_status}
                            onChange={(e) => updateField('payment_status', e.target.value)}
                            className="w-full rounded-lg border-neutral-300 dark:border-neutral-600 focus:border-indigo-500 focus:ring-indigo-500/50 bg-neutral-100 dark:bg-neutral-700 px-3 py-2"
                        >
                            <option value="none">No Payment</option>
                            <option value="active">Active</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-3">Quick Actions</h4>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => {
                                    setFormData(prev => ({
                                        ...prev,
                                        credits_analysis: prev.credits_analysis + 500,
                                        credits_enhancement: prev.credits_enhancement + 500,
                                        credits_exam: prev.credits_exam + 500,
                                        credits_export: prev.credits_export + 500,
                                        payment_status: 'active'
                                    }));
                                }}
                                className="px-3 py-1 bg-emerald-600 text-white text-xs rounded-full hover:bg-green-700 transition-colors"
                            >
                                Add Starter Pack (500 each)
                            </button>
                            <button
                                onClick={() => {
                                    setFormData(prev => ({
                                        ...prev,
                                        credits_analysis: prev.credits_analysis + 2000,
                                        credits_enhancement: prev.credits_enhancement + 2000,
                                        credits_exam: prev.credits_exam + 2000,
                                        credits_export: prev.credits_export + 2000,
                                        payment_status: 'active'
                                    }));
                                }}
                                className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full hover:bg-blue-700 transition-colors"
                            >
                                Add Pro Pack (2000 each)
                            </button>
                            <button
                                onClick={() => {
                                    setFormData(prev => ({
                                        ...prev,
                                        credits_analysis: 50,
                                        credits_enhancement: 45,
                                        credits_exam: 150,
                                        credits_export: 0,
                                        payment_status: 'none'
                                    }));
                                }}
                                className="px-3 py-1 bg-gray-600 text-white text-xs rounded-full hover:bg-gray-700 transition-colors"
                            >
                                Reset to Free Daily
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
                                Update Credits
                            </>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}