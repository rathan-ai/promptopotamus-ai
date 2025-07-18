'use client';

import { useAtom } from 'jotai';
import { sidebarAtom } from '@/lib/atoms';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { clsx } from 'clsx';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import { Button } from '@/components/ui/Button';
import { X, Moon, LogIn, LogOut, LayoutDashboard, Shield } from 'lucide-react';

const navItems = [
    { title: 'Home & Tools', links: [
      { href: '/#introduction', label: 'Introduction' },
      { href: '/#generator', label: 'Prompt Builder' }, 
      { href: '/#analyzer', label: 'Prompt Analyzer' },
    ]},
    { title: 'Resources', links: [
      { href: '/templates', label: 'AI Templates' },
      { href: '/#prompt-recipes', label: 'Prompt Recipes' },
    ]},
    { title: 'Guides', links: [
      { href: '/#basic-techniques', label: 'Basic Techniques' },
      { href: '/#advanced-techniques', label: 'Advanced Techniques' },
      { href: '/#industry-guides', label: 'Industry Examples' },
      { href: '/#exploring-models', label: 'Exploring Models' },
      { href: '/#best-practices', label: 'Best Practices' },
      { href: '/#risks-caution', label: 'Risks & Caution' },
    ]},
    { title: 'Certification', links: [{ href: '/certificates', label: 'Certification Exams' }]},
    { title: 'More', links: [{ href: '/#further-reading', label: 'Further Reading' }]},
];

interface Profile {
  role?: string;
}

export default function Sidebar() {
    const [isOpen, setIsOpen] = useAtom(sidebarAtom);
    const pathname = usePathname();
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }, []);
    
    useEffect(() => {
      const fetchUserAndProfile = async () => {
          const { data: { user } } = await supabase.auth.getUser();
          setUser(user);
          if (user) {
            const { data: profileData } = await supabase.from('profiles').select('role').eq('id', user.id).single();
            setProfile(profileData);
          }
      };
      fetchUserAndProfile();
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          setUser(session?.user ?? null);
          if (event === 'SIGNED_IN' && session?.user.id) {
            supabase.from('profiles').select('role').eq('id', session.user.id).single().then(({data}) => setProfile(data));
          }
          if (event === 'SIGNED_OUT') {
            setProfile(null);
          }
      });
  
      return () => subscription.unsubscribe();
    }, [supabase]);
  
    useEffect(() => { setIsOpen(false); }, [pathname, setIsOpen]);
    
    const toggleTheme = () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
    };
  
    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };
  
    return (
      <>
        <aside className={clsx(
            "fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 p-4 flex flex-col",
            "transition-transform duration-300 ease-in-out md:translate-x-0",
            { 'translate-x-0': isOpen, '-translate-x-full': !isOpen }
        )}>
          <div className="flex justify-between items-center mb-6 px-2">
              <Link href="/" className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">Promptopotamus</Link>
              <button className="md:hidden p-2" onClick={() => setIsOpen(false)}> <X /> </button>
          </div>
          
          <div className="mb-4 p-3 bg-neutral-100 dark:bg-neutral-800/50 rounded-lg">
              {user ? (
                  <div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Signed in as</p>
                      <p className="font-semibold truncate">{user.email}</p>
                      <div className="space-y-2 mt-3">
                        <Link href="/dashboard" className="flex items-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          View Dashboard
                        </Link>
                        {profile?.role === 'admin' && (
                          <Link href="/admin" className="flex items-center text-sm font-semibold text-red-500 hover:underline">
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Dashboard
                          </Link>
                        )}
                      </div>
                      <Button variant="link" size="sm" onClick={handleSignOut} className="text-red-500 p-0 h-auto mt-2">
                        <LogOut className="mr-1 h-4 w-4" /> Sign Out
                      </Button>
                  </div>
              ) : (
                  <Link href="/login" passHref>
                    <Button className="w-full">
                      <LogIn className="mr-2 h-4 w-4" /> Login / Sign Up
                    </Button>
                  </Link>
              )}
          </div>
  
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {navItems.map((section, i) => (
                <div key={i}>
                    <p className="px-3 pt-4 pb-2 text-xs font-semibold uppercase text-neutral-500 dark:text-neutral-400 tracking-wider">{section.title}</p>
                    {section.links.map((link, j) => (
                        <Link href={link.href} key={j} className="block py-2 px-3 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-300">
                            {link.label}
                        </Link>
                    ))}
                </div>
            ))}
          </nav>
          
          <div className="mt-6 space-y-2">
             <Button variant="outline" onClick={toggleTheme} className="w-full">
                 <Moon className="mr-2 h-4 w-4" /> Toggle Theme
             </Button>
          </div>
        </aside>
        {/* Mobile Overlay */}
        {isOpen && <div className="md:hidden fixed inset-0 bg-black/60 z-30" onClick={() => setIsOpen(false)}></div>}
      </>
    );
}