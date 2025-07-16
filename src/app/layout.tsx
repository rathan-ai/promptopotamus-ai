import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import { Provider } from 'jotai';
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const roboto_mono = Roboto_Mono({ subsets: ['latin'], variable: '--font-roboto-mono' });

export const metadata: Metadata = {
  title: "Promptopotamus",
  description: "The Ultimate Guide to AI Prompt Engineering",
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
            </div>
          </div>
        </Provider>
        <Analytics />
      </body>
    </html>
  );
}