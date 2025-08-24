'use client';

import { usePathname } from 'next/navigation';
import { Bell, Menu } from 'lucide-react';

const getPageTitle = (pathname: string): { title: string; description: string } => {
  switch (pathname) {
    case '/':
      return { title: 'Welcome to Promptopotamus', description: 'AI prompt engineering platform' };
    case '/tools':
      return { title: 'Prompt Tools', description: 'Interactive prompt builder and analyzer tools' };
    case '/dashboard':
      return { title: 'Dashboard', description: 'Your progress and activity overview' };
    case '/smart-prompts':
      return { title: 'Smart Prompts', description: 'Purchase professionally crafted AI prompts' };
    case '/templates':
      return { title: 'Free Templates', description: 'Ready-to-use prompt templates' };
    case '/guides':
      return { title: 'Learning Guides', description: 'Master AI prompt engineering' };
    case '/certificates':
      return { title: 'Certifications', description: 'Validate your AI skills with exams' };
    case '/resources':
      return { title: 'Resources', description: 'AI tools and platforms' };
    default:
      return { title: 'Promptopotamus', description: 'AI Prompt Engineering Platform' };
  }
};

export default function Header() {
  const pathname = usePathname();
  const { title, description } = getPageTitle(pathname);

  return (
    <div>
      <h1 className="page-title">{title}</h1>
      <p className="page-description">{description}</p>
    </div>
  );
}