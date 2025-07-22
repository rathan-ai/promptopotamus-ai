'use client';

import { useEffect, useState } from 'react';
import { BarChart, Users, Zap, Calendar, Clock, Link2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { certificates as certDetails } from '@/lib/data';
import AffiliateManager from '@/components/admin/AffiliateManager';

interface Stat {
  totalUsers: number;
  totalCertificates: number;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
  last_sign_in_at?: string;
  user_certificates: { id: number; certificate_slug: string; earned_at: string }[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stat | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'affiliates'>('dashboard');

  const fetchData = async () => {
    setLoading(true);
    const [statsRes, usersRes] = await Promise.all([
      fetch('/api/admin/stats'),
      fetch('/api/admin/users')
    ]);
    if (statsRes.ok) setStats(await statsRes.json());
    if (usersRes.ok) setUsers(await usersRes.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleReset = async (userId: string, certSlug: string) => {
    if (!confirm('Are you sure you want to reset this certificate and all related quiz attempts for this user?')) return;
    
    const res = await fetch('/api/admin/reset-certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, certSlug }),
    });

    const data = await res.json();
    if (res.ok) {
      toast.success(data.message);
      fetchData();
    } else {
      toast.error(data.error);
    }
  };
  
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();
  const formatDateTime = (dateString?: string) => dateString ? new Date(dateString).toLocaleString() : 'Never';

  const tabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart },
    { id: 'affiliates', name: 'Affiliate Manager', icon: Link2 },
  ];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Admin Dashboard</h1>
      
      {/* Tab Navigation */}
      <div className="mb-8">
        <div className="border-b border-neutral-200 dark:border-neutral-700">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'dashboard' | 'affiliates')}
                  className={`flex items-center px-1 py-4 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300 dark:text-neutral-400 dark:hover:text-neutral-300'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-neutral-600 dark:text-neutral-300 flex items-center"><Users className="mr-2" /> Total Users</h3>
          <p className="text-4xl font-bold mt-2">{loading ? '...' : stats?.totalUsers}</p>
        </div>
        <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-neutral-600 dark:text-neutral-300 flex items-center"><BarChart className="mr-2" /> Certificates Issued</h3>
          <p className="text-4xl font-bold mt-2">{loading ? '...' : stats?.totalCertificates}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-4 dark:text-white">User Management</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 dark:bg-neutral-700/50">
              <tr className="border-b dark:border-neutral-700">
                <th className="p-3 font-semibold">User</th>
                <th className="p-3 font-semibold">Role</th>
                <th className="p-3 font-semibold">Details</th>
                <th className="p-3 font-semibold">Certificates</th>
                <th className="p-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center p-8">Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan={5} className="text-center p-8 text-neutral-500">No users found.</td></tr>
              ) : (
                users.map(user => (
                  <tr key={user.id} className="border-b dark:border-neutral-700">
                    <td className="p-3 align-top">
                      <p className="font-bold">{user.full_name || 'N/A'}</p>
                      <p className="text-sm text-neutral-500">{user.email}</p>
                    </td>
                    <td className="p-3 align-top">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${user.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-3 align-top text-sm text-neutral-600 dark:text-neutral-400">
                      <div className="flex items-center"><Calendar className="mr-2 h-4 w-4" /> Registered: {formatDate(user.created_at)}</div>
                      <div className="flex items-center mt-1"><Clock className="mr-2 h-4 w-4" /> Last Seen: {formatDateTime(user.last_sign_in_at)}</div>
                    </td>
                    <td className="p-3 align-top">
                      {user.user_certificates.length > 0 ? (
                        <ul className="space-y-1">
                          {user.user_certificates.map(cert => (
                            <li key={cert.id} className="text-sm">
                              - {certDetails[cert.certificate_slug]?.badgeName || 'Unknown Cert'}
                            </li>
                          ))}
                        </ul>
                      ) : <span className="text-sm text-neutral-500">None</span>}
                    </td>
                    <td className="p-3 align-top">
                      {user.user_certificates.map(cert => (
                        <button 
                          key={cert.id}
                          onClick={() => handleReset(user.id, cert.certificate_slug)}
                          className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 flex items-center"
                        >
                          <Zap className="mr-1 h-3 w-3" /> Reset {certDetails[cert.certificate_slug]?.level}
                        </button>
                      ))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}
      
      {activeTab === 'affiliates' && (
        <AffiliateManager />
      )}
    </div>
  );
}