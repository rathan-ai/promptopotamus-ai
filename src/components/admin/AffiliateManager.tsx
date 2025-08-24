'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Plus, Edit, Trash2, ExternalLink, Save, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface AffiliateResource {
    id?: number;
    name: string;
    provider: string;
    description: string;
    price: string;
    category: string;
    badge: string;
    color: string;
    icon: string;
    affiliate_link: string;
    features: string[];
    rating: number;
    display_order: number;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

const defaultAffiliate: AffiliateResource = {
    name: '',
    provider: '',
    description: '',
    price: '',
    category: 'AI Assistant',
    badge: '',
    color: 'bg-blue-500',
    icon: '🤖',
    affiliate_link: '',
    features: [],
    rating: 5.0,
    display_order: 0,
    is_active: true
};

export default function AffiliateManager() {
    const [affiliates, setAffiliates] = useState<AffiliateResource[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingAffiliate, setEditingAffiliate] = useState<AffiliateResource | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchAffiliates();
    }, []);

    const fetchAffiliates = async () => {
        try {
            const response = await fetch('/api/admin/affiliates');
            if (!response.ok) throw new Error('Failed to fetch affiliates');
            const data = await response.json();
            setAffiliates(data);
        } catch (error) {
            toast.error('Failed to load affiliate resources');
            console.error('Fetch error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!editingAffiliate) return;
        setIsSaving(true);

        try {
            const isEditing = !!editingAffiliate.id;
            const url = '/api/admin/affiliates';
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingAffiliate)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save affiliate');
            }

            toast.success(`Affiliate ${isEditing ? 'updated' : 'created'} successfully`);
            setIsModalOpen(false);
            setEditingAffiliate(null);
            fetchAffiliates();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to save affiliate');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this affiliate resource?')) return;

        try {
            const response = await fetch(`/api/admin/affiliates?id=${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete affiliate');
            }

            toast.success('Affiliate deleted successfully');
            fetchAffiliates();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to delete affiliate');
        }
    };

    const openEditModal = (affiliate: AffiliateResource | null = null) => {
        setEditingAffiliate(affiliate || { ...defaultAffiliate });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingAffiliate(null);
    };

    const updateField = (field: keyof AffiliateResource, value: string | number | boolean | string[]) => {
        if (!editingAffiliate) return;
        setEditingAffiliate({ ...editingAffiliate, [field]: value });
    };

    const addFeature = () => {
        if (!editingAffiliate) return;
        setEditingAffiliate({
            ...editingAffiliate,
            features: [...editingAffiliate.features, '']
        });
    };

    const updateFeature = (index: number, value: string) => {
        if (!editingAffiliate) return;
        const newFeatures = [...editingAffiliate.features];
        newFeatures[index] = value;
        setEditingAffiliate({ ...editingAffiliate, features: newFeatures });
    };

    const removeFeature = (index: number) => {
        if (!editingAffiliate) return;
        const newFeatures = editingAffiliate.features.filter((_, i) => i !== index);
        setEditingAffiliate({ ...editingAffiliate, features: newFeatures });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-lg text-neutral-600 dark:text-neutral-400">Loading affiliate resources...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Affiliate Resources</h2>
                    <p className="text-neutral-600 dark:text-neutral-400">Manage affiliate links and resources</p>
                </div>
                <Button onClick={() => openEditModal()}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Affiliate
                </Button>
            </div>

            {/* Affiliates List */}
            <div className="grid gap-4">
                {affiliates.map((affiliate) => (
                    <div key={affiliate.id} className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4 flex-1">
                                <div className="text-2xl">{affiliate.icon}</div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-lg text-neutral-900 dark:text-white">
                                            {affiliate.name}
                                        </h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${affiliate.color}`}>
                                            {affiliate.badge}
                                        </span>
                                        {!affiliate.is_active && (
                                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                                                Inactive
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                                        by {affiliate.provider} • {affiliate.price} • {affiliate.category}
                                    </p>
                                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                                        {affiliate.description}
                                    </p>
                                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                                        <span>Rating: {affiliate.rating}/5</span>
                                        <span>Order: {affiliate.display_order}</span>
                                        <span>Features: {affiliate.features.length}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                                <a
                                    href={affiliate.affiliate_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 text-neutral-500 hover:text-blue-600 transition-colors"
                                    title="Visit affiliate link"
                                >
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                                <button
                                    onClick={() => openEditModal(affiliate)}
                                    className="p-2 text-neutral-500 hover:text-blue-600 transition-colors"
                                    title="Edit affiliate"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => affiliate.id && handleDelete(affiliate.id)}
                                    className="p-2 text-neutral-500 hover:text-slate-600 transition-colors"
                                    title="Delete affiliate"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
                {affiliates.length === 0 && (
                    <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                        No affiliate resources found. Add your first affiliate link!
                    </div>
                )}
            </div>

            {/* Edit/Create Modal */}
            {isModalOpen && editingAffiliate && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-neutral-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                                    {editingAffiliate.id ? 'Edit' : 'Create'} Affiliate Resource
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            {/* Basic Info */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={editingAffiliate.name}
                                        onChange={(e) => updateField('name', e.target.value)}
                                        className="w-full rounded-lg border-neutral-300 dark:border-neutral-600 focus:border-indigo-500 focus:ring-indigo-500/50 bg-neutral-100 dark:bg-neutral-700 px-3 py-2"
                                        placeholder="e.g., ChatGPT Plus"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                        Provider *
                                    </label>
                                    <input
                                        type="text"
                                        value={editingAffiliate.provider}
                                        onChange={(e) => updateField('provider', e.target.value)}
                                        className="w-full rounded-lg border-neutral-300 dark:border-neutral-600 focus:border-indigo-500 focus:ring-indigo-500/50 bg-neutral-100 dark:bg-neutral-700 px-3 py-2"
                                        placeholder="e.g., OpenAI"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={editingAffiliate.description}
                                    onChange={(e) => updateField('description', e.target.value)}
                                    rows={3}
                                    className="w-full rounded-lg border-neutral-300 dark:border-neutral-600 focus:border-indigo-500 focus:ring-indigo-500/50 bg-neutral-100 dark:bg-neutral-700 px-3 py-2"
                                    placeholder="Brief description of the service..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                    Affiliate Link *
                                </label>
                                <input
                                    type="url"
                                    value={editingAffiliate.affiliate_link}
                                    onChange={(e) => updateField('affiliate_link', e.target.value)}
                                    className="w-full rounded-lg border-neutral-300 dark:border-neutral-600 focus:border-indigo-500 focus:ring-indigo-500/50 bg-neutral-100 dark:bg-neutral-700 px-3 py-2"
                                    placeholder="https://example.com?ref=promptopotamus"
                                />
                            </div>

                            {/* Details */}
                            <div className="grid md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                        Price
                                    </label>
                                    <input
                                        type="text"
                                        value={editingAffiliate.price}
                                        onChange={(e) => updateField('price', e.target.value)}
                                        className="w-full rounded-lg border-neutral-300 dark:border-neutral-600 focus:border-indigo-500 focus:ring-indigo-500/50 bg-neutral-100 dark:bg-neutral-700 px-3 py-2"
                                        placeholder="e.g., $20/month"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                        Category
                                    </label>
                                    <select
                                        value={editingAffiliate.category}
                                        onChange={(e) => updateField('category', e.target.value)}
                                        className="w-full rounded-lg border-neutral-300 dark:border-neutral-600 focus:border-indigo-500 focus:ring-indigo-500/50 bg-neutral-100 dark:bg-neutral-700 px-3 py-2"
                                    >
                                        <option value="AI Assistant">AI Assistant</option>
                                        <option value="Productivity">Productivity</option>
                                        <option value="Image Generation">Image Generation</option>
                                        <option value="Writing Tools">Writing Tools</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                        Badge
                                    </label>
                                    <input
                                        type="text"
                                        value={editingAffiliate.badge}
                                        onChange={(e) => updateField('badge', e.target.value)}
                                        className="w-full rounded-lg border-neutral-300 dark:border-neutral-600 focus:border-indigo-500 focus:ring-indigo-500/50 bg-neutral-100 dark:bg-neutral-700 px-3 py-2"
                                        placeholder="e.g., Most Popular"
                                    />
                                </div>
                            </div>

                            <div className="grid md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                        Icon
                                    </label>
                                    <input
                                        type="text"
                                        value={editingAffiliate.icon}
                                        onChange={(e) => updateField('icon', e.target.value)}
                                        className="w-full rounded-lg border-neutral-300 dark:border-neutral-600 focus:border-indigo-500 focus:ring-indigo-500/50 bg-neutral-100 dark:bg-neutral-700 px-3 py-2"
                                        placeholder="🤖"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                        Color Class
                                    </label>
                                    <select
                                        value={editingAffiliate.color}
                                        onChange={(e) => updateField('color', e.target.value)}
                                        className="w-full rounded-lg border-neutral-300 dark:border-neutral-600 focus:border-indigo-500 focus:ring-indigo-500/50 bg-neutral-100 dark:bg-neutral-700 px-3 py-2"
                                    >
                                        <option value="bg-blue-500">Blue</option>
                                        <option value="bg-emerald-600">Green</option>
                                        <option value="bg-slate-500">Purple</option>
                                        <option value="bg-orange-500">Orange</option>
                                        <option value="bg-pink-500">Pink</option>
                                        <option value="bg-gray-500">Gray</option>
                                        <option value="bg-slate-500">Red</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                        Rating
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        min="1"
                                        max="5"
                                        value={editingAffiliate.rating}
                                        onChange={(e) => updateField('rating', parseFloat(e.target.value))}
                                        className="w-full rounded-lg border-neutral-300 dark:border-neutral-600 focus:border-indigo-500 focus:ring-indigo-500/50 bg-neutral-100 dark:bg-neutral-700 px-3 py-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                        Display Order
                                    </label>
                                    <input
                                        type="number"
                                        value={editingAffiliate.display_order}
                                        onChange={(e) => updateField('display_order', parseInt(e.target.value))}
                                        className="w-full rounded-lg border-neutral-300 dark:border-neutral-600 focus:border-indigo-500 focus:ring-indigo-500/50 bg-neutral-100 dark:bg-neutral-700 px-3 py-2"
                                    />
                                </div>
                            </div>

                            {/* Features */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                        Features
                                    </label>
                                    <Button onClick={addFeature} size="sm" variant="outline">
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add Feature
                                    </Button>
                                </div>
                                <div className="space-y-2">
                                    {editingAffiliate.features.map((feature, index) => (
                                        <div key={index} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={feature}
                                                onChange={(e) => updateFeature(index, e.target.value)}
                                                className="flex-1 rounded-lg border-neutral-300 dark:border-neutral-600 focus:border-indigo-500 focus:ring-indigo-500/50 bg-neutral-100 dark:bg-neutral-700 px-3 py-2"
                                                placeholder="Feature description"
                                            />
                                            <button
                                                onClick={() => removeFeature(index)}
                                                className="p-2 text-slate-500 hover:text-red-700 transition-colors"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Status */}
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={editingAffiliate.is_active}
                                    onChange={(e) => updateField('is_active', e.target.checked)}
                                    className="rounded border-neutral-300 dark:border-neutral-600"
                                />
                                <label htmlFor="is_active" className="text-sm text-neutral-700 dark:text-neutral-300">
                                    Active (visible to users)
                                </label>
                            </div>
                        </div>

                        {/* Modal Actions */}
                        <div className="p-6 border-t border-neutral-200 dark:border-neutral-700 flex gap-2 justify-end">
                            <Button onClick={closeModal} variant="outline">
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
                                        {editingAffiliate.id ? 'Update' : 'Create'}
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}