'use client';

import { useAtom } from 'jotai';
import { sidebarAtom } from '@/lib/atoms';
import Link from 'next/link';
import { Menu, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Header() {
    const [, setIsOpen] = useAtom(sidebarAtom);
    const [isScrolled, setIsScrolled] = useState(false);
    
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    return (
        <header className={`
            md:hidden sticky top-0 z-30 flex items-center justify-between p-4 
            transition-all duration-300
            ${isScrolled 
                ? 'bg-white/95 dark:bg-neutral-900/95 backdrop-blur-md shadow-lg border-b border-neutral-200/50 dark:border-neutral-800/50' 
                : 'bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b border-transparent'
            }
        `}>
            <Link 
                href="/" 
                className={`
                    font-bold transition-all duration-300
                    ${isScrolled ? 'text-xl' : 'text-lg'}
                    text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300
                `}
            >
                Promptopotamus
            </Link>
            
            {/* Mobile Menu Button */}
            <button 
                onClick={() => setIsOpen(true)} 
                className={`
                    p-2 rounded-lg transition-all duration-300
                    hover:bg-neutral-100 dark:hover:bg-neutral-800
                    ${isScrolled ? 'scale-95' : 'scale-100'}
                `}
                aria-label="Open navigation menu"
            >
                <Menu className="w-6 h-6" />
            </button>
        </header>
    );
}