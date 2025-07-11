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
    { href: '#visual-prompting', label: 'Visual Prompting' },
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
        <aside className="w-full md:w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-6 sticky top-0 h-screen overflow-y-auto">
            <h1 className="text-2xl font-extrabold text-primary-600 dark:text-indigo-400 mb-8">Prompting Guide</h1>
            <nav className="space-y-2">
                {navItems.map((section, i) => (
                    <div key={i}>
                        <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 mt-6">{section.title}</p>
                        {section.links.map((link, j) => (
                            <a href={link.href} key={j} className={`block py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition ${activeLink === link.href.substring(1) ? 'nav-link active' : ''}`}>
                                {link.label}
                            </a>
                        ))}
                    </div>
                ))}
            </nav>
            <button onClick={toggleTheme} className="mt-8 w-full py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition">Toggle Theme</button>
        </aside>
    );
}