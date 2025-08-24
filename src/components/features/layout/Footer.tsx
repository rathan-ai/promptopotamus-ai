'use client';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className="text-center text-sm text-gray-600 dark:text-gray-400">
      © {currentYear} Promptopotamus. All rights reserved.
    </div>
  );
}