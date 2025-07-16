'use client';

import { Copy } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from './ui/Button';

interface TemplateCardProps {
  title: string;
  prompt: string;
}

export default function TemplateCard({ title, prompt }: TemplateCardProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(prompt);
    toast.success('Prompt copied to clipboard!');
  };

  return (
    <div className="bg-white dark:bg-neutral-800/50 p-6 rounded-xl shadow-md border border-neutral-200 dark:border-neutral-700 flex flex-col">
      <h3 className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{title}</h3>
      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 flex-grow">{prompt}</p>
      <div className="mt-4 text-right">
        <Button onClick={handleCopy} variant="secondary" size="sm">
          <Copy className="mr-2 h-4 w-4" />
          Copy Prompt
        </Button>
      </div>
    </div>
  );
}