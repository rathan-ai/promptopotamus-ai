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
import { X, LogIn, LogOut, LayoutDashboard, Shield, Award, Brain, Coins } from 'lucide-react';
import { track } from '@vercel/analytics';
import UserIdentityBadge from '../profiles/UserIdentityBadge';

const navItems = [
    { title: 'Home & Tools', links: [
      { href: '/#introduction', label: 'Introduction' },
      { href: '/#generator', label: 'Prompt Builder' }, 
      { href: '/#analyzer', label: 'Prompt Analyzer' },
    ]},
    { title: 'AI Content & Templates', links: [
      { href: '/templates', label: 'AI Templates' },
      { href: '/#prompt-recipes', label: 'Prompt Recipes' },
      { href: '/resources', label: 'Premium Tools' },
    ]},
    { title: 'Guides', links: [
      { href: '/#basic-techniques', label: 'Basic Techniques' },
      { href: '/#advanced-techniques', label: 'Advanced Techniques' },
      { href: '/#industry-guides', label: 'Industry Examples' },
      { href: '/#exploring-models', label: 'Exploring Models' },
      { href: '/#best-practices', label: 'Best Practices' },
      { href: '/#risks-caution', label: 'Risks & Caution' },
    ]},
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
  
    const handleSignOut = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };
  
    return (
      <>
        <aside className={clsx(
            "fixed inset-y-0 left-0 z-40 w-72 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md border-r border-neutral-200/50 dark:border-neutral-800/50 p-4 flex flex-col shadow-xl",
            "transition-all duration-300 ease-in-out md:translate-x-0",
            { 'translate-x-0': isOpen, '-translate-x-full': !isOpen }
        )}>
          <div className="flex justify-between items-center mb-6 px-2">
              <Link href="/" className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">Promptopotamus</Link>
              <button className="md:hidden p-2" onClick={() => setIsOpen(false)}> <X /> </button>
          </div>
          
          <div className="mb-4 bg-neutral-100 dark:bg-neutral-800/50 rounded-lg overflow-hidden">
              {user ? (
                  <div>
                      {/* User Identity Strip */}
                      <div className="px-3 py-1">
                        <UserIdentityBadge user={user} size="sm" showTierName={false} />
                      </div>
                      
                      {/* User Info */}
                      <div className="px-3 pb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">Welcome back</p>
                            <div 
                              className="text-sm font-semibold truncate cursor-pointer" 
                              title={user.email}
                            >
                              {user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'}
                            </div>
                          </div>
                        </div>
                        
                        {/* PromptCoin Balance */}
                        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 mb-2">
                          <div className="flex items-center justify-between">
                            <Link 
                              href="/promptcoin-history"
                              className="text-xs text-amber-700 dark:text-amber-300 hover:text-amber-800 dark:hover:text-amber-200 font-medium"
                              onClick={() => {
                                track('promptcoin_history_access', {
                                  user_email: user.email || 'unknown',
                                  source: 'sidebar_balance',
                                  balance: promptCoinBalance
                                });
                              }}
                            >
                              View History
                            </Link>
                          </div>
                        </div>
                      
                      {/* Navigation Links */}
                      <div className="space-y-2 px-3 pb-3">
                        <Link 
                            href="/dashboard" 
                            onClick={() => {
                                track('dashboard_access', {
                                    user_email: user.email || 'unknown',
                                    source: 'sidebar'
                                });
                            }}
                            className="flex items-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          View Dashboard
                        </Link>
                        <Link 
                            href="/certificates" 
                            onClick={() => {
                                track('certificates_access', {
                                    user_email: user.email || 'unknown',
                                    source: 'sidebar_profile'
                                });
                            }}
                            className="flex items-center text-sm font-semibold text-green-600 dark:text-green-400 hover:underline"
                        >
                          <Award className="mr-2 h-4 w-4" />
                          Certification Exams
                        </Link>
                        <Link 
                            href="/smart-prompts" 
                            onClick={() => {
                                track('smart_prompts_access', {
                                    user_email: user.email || 'unknown',
                                    source: 'sidebar_profile'
                                });
                            }}
                            className="flex items-center text-sm font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                        >
                          <Brain className="mr-2 h-4 w-4" />
                          Smart Prompts
                        </Link>
                        {profile?.role === 'admin' && (
                          <Link 
                              href="/admin"
                              onClick={() => {
                                  track('admin_access', {
                                      user_email: user.email || 'unknown',
                                      source: 'sidebar'
                                  });
                              }} 
                              className="flex items-center text-sm font-semibold text-red-500 hover:underline"
                          >
                            <Shield className="mr-2 h-4 w-4" />
                            Admin Dashboard
                          </Link>
                        )}
                      </div>
                      <Button 
                          variant="link" 
                          size="sm" 
                          onClick={() => {
                              track('user_sign_out', {
                                  user_email: user.email || 'unknown',
                                  source: 'sidebar'
                              });
                              handleSignOut();
                          }} 
                          className="text-red-500 p-0 h-auto mt-2"
                      >
                        <LogOut className="mr-1 h-4 w-4" /> Sign Out
                      </Button>
                      </div>
                  </div>
              ) : (
                  <Link 
                      href="/login" 
                      onClick={() => {
                          track('login_access', {
                              source: 'sidebar'
                          });
                      }}
                      passHref
                  >
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
                        <Link 
                            href={link.href} 
                            key={j} 
                            onClick={() => {
                                // Track navigation clicks
                                track('navigation_click', {
                                    section: section.title,
                                    label: link.label,
                                    href: link.href,
                                    is_external: link.href.startsWith('http'),
                                    is_anchor: link.href.includes('#')
                                });
                            }}
                            className="block py-2 px-3 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-neutral-600 dark:text-neutral-300"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>
            ))}
          </nav>
          
        </aside>
        {/* Mobile Overlay */}
        {isOpen && <div className="md:hidden fixed inset-0 bg-black/60 z-30" onClick={() => setIsOpen(false)}></div>}
      </>
    );
}