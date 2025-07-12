import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import Sidebar from "../components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Ultimate Prompting Guide",
  description: "A complete guide to prompt engineering with interactive tools.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en" className="scroll-smooth dark">
      <body className={`${inter.className} bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200`}>
        <div className="flex flex-col md:flex-row min-h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto pt-16 md:pt-8 px-4 md:px-10 lg:px-16">{children}</main>
        </div>
        <Analytics />
      </body>
    </html>
  );
}