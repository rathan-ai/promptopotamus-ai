'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AdminStatusDebug() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      const supabase = createClient();
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setStatus({ 
          isAuthenticated: false, 
          message: 'Not logged in' 
        });
        setLoading(false);
        return;
      }
      
      // Check profile role
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role, full_name, email')
        .eq('id', user.id)
        .single();
      
      // Also check via API
      const apiResponse = await fetch('/api/admin/check-status');
      const apiData = await apiResponse.json();
      
      setStatus({
        isAuthenticated: true,
        userId: user.id,
        email: user.email,
        profile: profile,
        profileError: error,
        apiResponse: apiData,
        isAdmin: profile?.role === 'admin'
      });
      
      setLoading(false);
    };
    
    checkStatus();
  }, []);

  if (loading) return <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded">Checking admin status...</div>;

  return (
    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded space-y-2">
      <h3 className="font-bold text-slate-700 dark:text-slate-300">Admin Status Debug</h3>
      <pre className="text-xs overflow-auto bg-white dark:bg-slate-900 p-2 rounded">
        {JSON.stringify(status, null, 2)}
      </pre>
      {status?.isAdmin && (
        <div className="text-green-600 dark:text-green-400 font-bold">
          ✓ User is Admin - Dashboard should be visible
        </div>
      )}
      {!status?.isAdmin && status?.isAuthenticated && (
        <div className="text-yellow-600 dark:text-yellow-400">
          ⚠ User is authenticated but not admin. Role: {status?.profile?.role || 'not set'}
        </div>
      )}
    </div>
  );
}