import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import { Provider } from 'jotai';
import Sidebar from "@/components/features/layout/Sidebar";
import Header from "@/components/features/layout/Header";
import Footer from "@/components/features/layout/Footer";
import { Analytics } from "@vercel/analytics/react";
import IssueReportWidget from "@/components/features/shared/IssueReportWidget";
import PerformanceOptimizer from "@/components/features/shared/PerformanceOptimizer";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const roboto_mono = Roboto_Mono({ subsets: ['latin'], variable: '--font-roboto-mono' });

export const metadata: Metadata = {
  title: {
    default: "Promptopotamus - AI Prompt Engineering & Smart Prompts Marketplace",
    template: "%s | Promptopotamus"
  },
  description: "Master AI prompt engineering with our certification system and discover Smart Prompts marketplace. Created by Innorag Technologies - your path to prompt mastery.",
  keywords: ["AI prompts", "prompt engineering", "ChatGPT", "artificial intelligence", "smart prompts", "AI certification", "prompt marketplace"],
  authors: [{ name: "Innorag Technologies Private Limited" }],
  creator: "Innorag Technologies Private Limited",
  publisher: "Innorag Technologies Private Limited",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://promptopotamus.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Promptopotamus - AI Prompt Engineering & Smart Prompts Marketplace',
    description: 'Master AI prompt engineering with our certification system and discover Smart Prompts marketplace.',
    siteName: 'Promptopotamus',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Promptopotamus - AI Prompt Engineering & Smart Prompts Marketplace',
    description: 'Master AI prompt engineering with our certification system and discover Smart Prompts marketplace.',
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32', type: 'image/x-icon' }
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Add suppressHydrationWarning to fix client-side interactivity
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${roboto_mono.variable} font-sans text-neutral-800 dark:text-neutral-200`}>
        <Provider>
          <Toaster />
          <div className="flex min-h-screen bg-neutral-50 dark:bg-neutral-900">
            <Sidebar />
            <div className="flex-1 flex flex-col md:ml-72">
              <Header />
              <main className="flex-1 p-4 md:p-8">
                {children}
              </main>
              <Footer />
            </div>
          </div>
          
          {/* Global Issue Report Widget */}
          <IssueReportWidget />
          
          {/* Performance Optimization */}
          <PerformanceOptimizer />
        </Provider>
        <Analytics />
      </body>
    </html>
  );
}