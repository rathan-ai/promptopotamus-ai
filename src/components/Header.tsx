'use client';

import { useAtom } from 'jotai';
import { sidebarAtom } from '@/lib/atoms';
import Link from 'next/link';
import { Menu } from 'lucide-react';

export default function Header() {
    const [, setIsOpen] = useAtom(sidebarAtom);
    
    return (
        <header className="md:hidden sticky top-0 z-30 flex items-center justify-between p-4 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-sm border-b dark:border-neutral-800">
            <Link href="/" className="text-lg font-extrabold text-indigo-600 dark:text-indigo-400">
                Promptopotamus
            </Link>
            <button onClick={() => setIsOpen(true)} className="p-2">
                <Menu />
            </button>
        </header>
    );
}