'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Home, BookOpen, ShoppingCart, Award, Settings, User, LogOut, BarChart3, Wand2, Search, FileText, DollarSign, Globe, Shield } from 'lucide-react';
import { isAdmin } from '@/lib/auth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  requiresAuth?: boolean;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Check if user is admin
      if (user) {
        const adminStatus = await isAdmin(supabase);
        setIsAdminUser(adminStatus);
      } else {
        setIsAdminUser(false);
      }
    };
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      // Check admin status on auth state change
      if (session?.user) {
        const adminStatus = await isAdmin(supabase);
        setIsAdminUser(adminStatus);
      } else {
        setIsAdminUser(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const navItems: NavItem[] = [
    {
      label: 'Home',
      href: '/',
      icon: <Globe className="w-4 h-4" />
    },
    {
      label: 'My Dashboard',
      href: '/dashboard',
      icon: <Home className="w-4 h-4" />,
      requiresAuth: true
    },
    {
      label: 'Prompt Tools',
      href: '/tools',
      icon: <Wand2 className="w-4 h-4" />
    },
    {
      label: 'Smart Prompts',
      href: '/smart-prompts',
      icon: <ShoppingCart className="w-4 h-4" />,
      requiresAuth: true
    },
    {
      label: 'Templates',
      href: '/templates',
      icon: <FileText className="w-4 h-4" />
    },
    {
      label: 'Guides',
      href: '/guides',
      icon: <BookOpen className="w-4 h-4" />
    },
    {
      label: 'Certificates',
      href: '/certificates',
      icon: <Award className="w-4 h-4" />,
      requiresAuth: true
    },
    {
      label: 'Resources',
      href: '/resources',
      icon: <BarChart3 className="w-4 h-4" />
    }
  ];
  
  // Add admin dashboard after personal dashboard if user is admin
  if (isAdminUser) {
    navItems.splice(2, 0, {
      label: 'Admin Panel',
      href: '/admin',
      icon: <Shield className="w-4 h-4" />,
      requiresAuth: true
    });
  }

  // Filter nav items based on authentication status
  const visibleNavItems = navItems.filter(item => !item.requiresAuth || user);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <>
      {/* Brand */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <Link href="/" className="text-xl font-bold text-slate-700 dark:text-slate-300">
          Promptopotamus
        </Link>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {visibleNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`sidebar-nav-item ${pathname === item.href ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* User Section */}
      <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
        {user ? (
          <div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-3">
              <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.email?.split('@')[0]}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {user.email}
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="btn btn-secondary w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        ) : (
          <Link href="/login">
            <button className="btn btn-primary w-full">
              <User className="w-4 h-4 mr-2" />
              Sign In
            </button>
          </Link>
        )}
      </div>
    </>
  );
}