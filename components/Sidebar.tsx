'use client';
import { useState, useEffect } from 'react';

const navItems = [
  { title: 'Tools', links: [{ href: '#generator', label: 'Prompt Builder' }, { href: '#analyzer', label: 'Prompt Analyzer' }] },
  { title: 'Fundamentals', links: [
    { href: '#introduction', label: 'Introduction' },
    { href: '#basic-techniques', label: 'Basic Techniques' },
    { href: '#advanced-techniques', label: 'Advanced Techniques' },
    { href: '#prompt-recipes', label: 'Prompt Recipes' },
  ]},
  { title: 'Advanced Topics', links: [
    { href: '#exploring-models', label: 'Exploring Models' },
  ]},
  { title: 'Industry Guides', links: [
    { href: '#industry-education', label: 'Education' },
    { href: '#industry-engineering', label: 'Engineering' },
    { href: '#industry-finance', label: 'Finance & Stock Market' },
  ]},
  { title: 'Best Practices', links: [
      { href: '#best-practices', label: 'Best Practices' },
      { href: '#further-reading', label: 'Further Reading' },
      { href: '#risks-caution', label: 'Risks & Caution' },
  ]},
];

export default function Sidebar() {
    const [isOpen, setIsOpen] = useState(false);
    const [activeLink, setActiveLink] = useState('');
    useEffect(() => {
        const handleScroll = () => {
            let current = '';
            document.querySelectorAll('main section').forEach(section => {
                const sectionTop = (section as HTMLElement).offsetTop;
                if (window.scrollY >= sectionTop - 100) {
                    current = section.getAttribute('id') || '';
                }
            });
            setActiveLink(current);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    const toggleTheme = () => document.documentElement.classList.toggle('dark');
    return (
        <>
            <button
                className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                onClick={() => setIsOpen(true)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>

            <aside
                className={`fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 transform transition-transform duration-300 ease-in-out md:sticky md:translate-x-0 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                <button
                    className="md:hidden absolute top-4 right-4 p-2"
                    onClick={() => setIsOpen(false)}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
                <h1 className="text-2xl font-extrabold text-primary-600 dark:text-indigo-400 mb-8">Prompting Guide</h1>
                <nav className="space-y-2">
                    {navItems.map((section, i) => (
                        <div key={i}>
                            <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mt-6">{section.title}</p>
                            {section.links.map((link, j) => (
                                <a href={link.href} key={j} onClick={() => setIsOpen(false)} className={`block py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition ${activeLink === link.href.substring(1) ? 'nav-link active' : ''}`}>
                                    {link.label}
                                </a>
                            ))}
                        </div>
                    ))}
                </nav>
                <button onClick={toggleTheme} className="mt-8 w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition">Toggle Theme</button>
            </aside>
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/30 z-30"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}
        </>
    );
}