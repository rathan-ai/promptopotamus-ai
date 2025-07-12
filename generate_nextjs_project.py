# Filename: setup_prompting_guide.py
# Description: This script scaffolds the complete "Ultimate Prompting Guide" Next.js website.
# Run this script in an EMPTY directory.

import os
import textwrap
import json
import subprocess

def create_project_structure():
    """Creates the necessary directories for the project."""
    print("Creating project directories...")
    dirs = ["app", "components"]
    for d in dirs:
        if not os.path.exists(d):
            os.makedirs(d)
            print(f"  - Created directory: {d}")
    return True

def create_package_json():
    """Creates the package.json file with all dependencies."""
    print("Creating package.json...")
    package_data = {
      "name": "prompting-guide",
      "version": "0.1.0",
      "private": True,
      "scripts": {
        "dev": "next dev",
        "build": "next build",
        "start": "next start",
        "lint": "next lint"
      },
      "dependencies": {
        "next": "14.2.4",
        "react": "^18",
        "react-dom": "^18",
        "@vercel/analytics": "^1.3.1"
      },
      "devDependencies": {
        "postcss": "^8",
        "tailwindcss": "^3.4.1",
        "eslint": "^8",
        "eslint-config-next": "14.2.4",
        "@tailwindcss/forms": "^0.5.7",
        "@tailwindcss/typography": "^0.5.10",
        "autoprefixer": "^10.0.1",
        "@types/react": "^18",
        "@types/node": "^20",
        "typescript": "^5"
      }
    }
    try:
        with open("package.json", "w") as f:
            json.dump(package_data, f, indent=2)
        print("  - Successfully created package.json")
        return True
    except IOError as e:
        print(f"  - Error creating package.json: {e}")
        return False

def create_config_files():
    """Creates or overwrites necessary configuration files."""
    print("Creating configuration files...")
    configs = {
        "tailwind.config.js": """
            /** @type {import('tailwindcss').Config} */
            module.exports = {
              darkMode: 'class',
              content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
              theme: { extend: { colors: { primary: {'50':'#eff6ff','100':'#dbeafe','200':'#bfdbfe','300':'#93c5fd','400':'#60a5fa','500':'#3b82f6','600':'#2563eb','700':'#1d4ed8','800':'#1e40af','900':'#1e3a8a','950':'#172554'} } } },
              plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
            };
        """,
        "postcss.config.js": """
            module.exports = { plugins: { 'tailwindcss': {}, 'autoprefixer': {} } };
        """,
        "next.config.js": """
            /** @type {import('next').NextConfig} */
            const nextConfig = { reactStrictMode: true };
            module.exports = nextConfig;
        """,
        "tsconfig.json": """
            {
              "compilerOptions": {
                "lib": ["dom", "dom.iterable", "esnext"],
                "allowJs": true,
                "skipLibCheck": true,
                "strict": true,
                "noEmit": true,
                "esModuleInterop": true,
                "module": "esnext",
                "moduleResolution": "bundler",
                "resolveJsonModule": true,
                "isolatedModules": true,
                "jsx": "preserve",
                "incremental": true,
                "plugins": [{"name": "next"}],
                "paths": {"@/*": ["./*"]}
              },
              "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
              "exclude": ["node_modules"]
            }
        """
    }
    for path, content in configs.items():
        try:
            with open(path, "w") as f: f.write(textwrap.dedent(content).strip())
            print(f"  - Successfully created/updated '{path}'.")
        except IOError as e:
            print(f"  - Error creating file {path}: {e}")
            return False
    if os.path.exists('next.config.ts'):
        os.remove('next.config.ts')
        print("Removed 'next.config.ts'.")
    return True

def create_base_styles_and_layout():
    """Creates the main app directory, globals.css, and layout.tsx."""
    print("Creating base styles and layout...")
    files = {
        "app/globals.css": "@tailwind base;\n@tailwind components;\n@tailwind utilities;",
        "app/layout.tsx": """
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
                        <main className="flex-1 overflow-y-auto py-8 px-4 md:px-10 lg:px-16">{children}</main>
                    </div>
                    <Analytics />
                  </body>
                </html>
              );
            }
        """
    }
    for path, content in files.items():
        try:
            with open(path, "w") as f: f.write(textwrap.dedent(content).strip())
            print(f"  - Successfully created/updated '{path}'.")
        except IOError as e:
            print(f"  - Error creating file {path}: {e}")
            return False
    return True

def create_page_and_components():
    """Generates all the React component files."""
    print("Creating page and component files...")
    
    # Main Page
    page_content = """
        import PromptBuilder from '../components/PromptBuilder';
        import Introduction from '../components/Introduction';
        import LLMConfiguration from '../components/LLMConfiguration';
        import BasicTechniques from '../components/BasicTechniques';
        import AdvancedTechniques from '../components/AdvancedTechniques';
        import CodePrompting from '../components/CodePrompting';
        import BestPractices from '../components/BestPractices';

        export default function HomePage() {
          return (
            <div className="max-w-4xl mx-auto space-y-12">
              <PromptBuilder />
              <hr className="my-12 border-t-2 border-gray-200 dark:border-gray-700" />
              <Introduction />
              <hr className="my-12 border-t-2 border-gray-200 dark:border-gray-700" />
              <LLMConfiguration />
              <hr className="my-12 border-t-2 border-gray-200 dark:border-gray-700" />
              <BasicTechniques />
              <hr className="my-12 border-t-2 border-gray-200 dark:border-gray-700" />
              <AdvancedTechniques />
              <hr className="my-12 border-t-2 border-gray-200 dark:border-gray-700" />
              <CodePrompting />
              <hr className="my-12 border-t-2 border-gray-200 dark:border-gray-700" />
              <BestPractices />
               <footer className="text-center text-gray-500 dark:text-gray-400 text-sm mt-16 pt-8 border-t border-gray-200 dark:border-gray-700">
                <p>Developed with ❤️ by <a href="https://innorag.com" target="_blank" rel="noopener noreferrer" className="text-primary-600 dark:text-indigo-400 hover:underline">innorag</a></p>
              </footer>
            </div>
          );
        }
    """
    with open("app/page.tsx", "w") as f: f.write(textwrap.dedent(page_content).strip())
    print("  - Successfully created 'app/page.tsx'.")

    # Static Guide Components
    static_components = {
        "Introduction": { "id": "introduction", "title": "Introduction", "content": """<p className="text-gray-700 dark:text-gray-300 mb-4">A prompt is the input you provide to a Large Language Model (LLM) to get a specific output. Crafting an effective prompt involves model choice, wording, structure, and context—it’s a creative and iterative process.</p><blockquote className="border-l-4 border-primary-500 dark:border-indigo-400 pl-4 italic text-gray-600 dark:text-gray-400">Prompt engineering is the process of designing high-quality prompts that guide LLMs to produce accurate and relevant outputs.</blockquote>""" },
        "LLMConfiguration": { "id": "llm-config", "title": "LLM Configuration", "content": """<p className="text-gray-700 dark:text-gray-300 mb-6">Most LLMs come with various configuration options that control the output. Effective prompt engineering requires setting these optimally for your task.</p><div className="space-y-4"><article className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow"><h4 className="font-medium mb-2">Temperature</h4><p className="text-gray-600 dark:text-gray-400">Controls the degree of randomness in the output. Lower temperatures (e.g., 0.1) are good for prompts that expect a more deterministic, factual response. Higher temperatures (e.g., 0.9) can lead to more diverse or creative results.</p></article><article className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow"><h4 className="font-medium mb-2">Top-K</h4><p className="text-gray-600 dark:text-gray-400">Restricts the model's output to the K most likely tokens. A low Top-K value makes the output more predictable, while a high value allows for more creativity.</p></article><article className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow"><h4 className="font-medium mb-2">Top-P</h4><p className="text-gray-600 dark:text-gray-400">Selects tokens based on their cumulative probability. It provides a more dynamic way to control randomness compared to Top-K.</p></article></div>""" },
        "BasicTechniques": { "id": "basic-techniques", "title": "Basic Prompting Techniques", "content": """<div className="grid md:grid-cols-2 gap-6"><article className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow"><h4 className="font-medium mb-2">Zero-Shot Prompting</h4><p className="text-gray-600 dark:text-gray-400 mb-4">The simplest prompt type: description only, no examples.</p><pre className="bg-white dark:bg-gray-800 p-4 rounded overflow-x-auto text-sm"><code>Classify the following movie review as POSITIVE, NEUTRAL, or NEGATIVE.\\n\\nReview: "Her" is a disturbing masterpiece. I wish there were more movies like this.\\nSentiment:</code></pre></article><article className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow"><h4 className="font-medium mb-2">One-Shot & Few-Shot Prompting</h4><p className="text-gray-600 dark:text-gray-400 mb-4">Provide one (one-shot) or multiple (few-shot) examples to teach the model a pattern.</p><pre className="bg-white dark:bg-gray-800 p-4 rounded overflow-x-auto text-sm"><code>Parse the pizza order into JSON.\\n\\nEXAMPLE:\\nI want a small pizza with cheese and pepperoni.\\nJSON: {"size": "small", "ingredients": ["cheese", "pepperoni"]}\\n\\nNow, I would like a medium pizza with mushrooms.\\nJSON:</code></pre></article></div>""" },
        "AdvancedTechniques": { "id": "advanced-techniques", "title": "Advanced Prompting Techniques", "content": """<div className="space-y-6"><article className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow"><h4 className="font-medium mb-2">Chain-of-Thought (CoT) Prompting</h4><p className="text-gray-600 dark:text-gray-400 mb-4">Encourage the model to think step-by-step for complex reasoning tasks.</p><pre className="bg-white dark:bg-gray-800 p-4 rounded overflow-x-auto text-sm"><code>When I was 3 years old, my partner was 3 times my age. Now, I am 20 years old. How old is my partner? Let's think step by step.</code></pre></article><article className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow"><h4 className="font-medium mb-2">Step-back Prompting</h4><p className="text-gray-600 dark:text-gray-400 mb-4">Prompt the LLM to first consider a general question related to the specific task, then feed that answer into a subsequent prompt.</p></article><article className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow"><h4 className="font-medium mb-2">Self-Consistency</h4><p className="text-gray-600 dark:text-gray-400 mb-4">Run the same prompt multiple times to generate diverse reasoning paths, then choose the most common answer.</p></article></div>""" },
        "CodePrompting": { "id": "code-prompting", "title": "Code Prompting", "content": """<p className="text-gray-700 dark:text-gray-300 mb-4">LLMs can write, explain, translate, and debug code. Be specific in your requests.</p><article className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow"><h4 className="font-medium mb-2">Example: Writing a Bash Script</h4><pre className="bg-white dark:bg-gray-800 p-4 rounded overflow-x-auto text-sm"><code>Write a code snippet in Bash, which asks for a folder name. Then it takes the contents of the folder and renames all the files inside by prepending the name 'draft' to the file name.</code></pre></article>""" },
        "BestPractices": { "id": "best-practices", "title": "Best Practices", "content": """<ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300"><li><strong>Provide Examples:</strong> Use few-shot prompts to guide formatting.</li><li><strong>Design with Simplicity:</strong> Keep prompts clear and concise.</li><li><strong>Be Specific About the Output:</strong> Define structure and style.</li><li><strong>Use Instructions over Constraints:</strong> Tell the model what to do.</li><li><strong>Experiment:</strong> Vary wording, order, and examples.</li><li><strong>Document Your Attempts:</strong> Track results for iterative improvement.</li></ul>""" }
    }
    
    for name, data in static_components.items():
        file_path = os.path.join("components", f"{name}.tsx")
        js_safe_content = data['content'].strip().replace('`', '\\`')
        
        component_code = f"""
import React from 'react';

export default function {name}() {{
  const contentHtml = `{js_safe_content}`;
  return (
    <section id="{data['id']}" className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
      <h2 className="text-3xl font-semibold mb-6">{data['title']}</h2>
      <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{{{ __html: contentHtml.replace(/\\\\n/g, '<br />') }}}} />
    </section>
  );
}}
"""
        with open(file_path, "w", encoding="utf-8") as f:
            f.write(textwrap.dedent(component_code).strip())
        print(f"  - Successfully created: {file_path}")

    # Interactive Components
    interactive_components = {
        "components/Sidebar.tsx": """
            'use client';
            import { useState, useEffect } from 'react';

            const navItems = [
              { title: 'Tools', links: [{ href: '#generator', label: 'Prompt Builder' }] },
              { title: 'Fundamentals', links: [
                { href: '#introduction', label: 'Introduction' },
                { href: '#llm-config', label: 'LLM Configuration' },
                { href: '#basic-techniques', label: 'Basic Techniques' },
                { href: '#advanced-techniques', label: 'Advanced Techniques' },
              ]},
              { title: 'Prompting Techniques', links: [
                { href: '#code-prompting', label: 'Code Prompting' },
              ]},
              { title: 'Best Practices', links: [
                  { href: '#best-practices', label: 'Best Practices' },
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
        """,
        "components/PromptBuilder.tsx": """
            'use client';
            import { useState } from 'react';

            const Loader = () => <div className="loader" style={{width: '20px', height: '20px', border: '3px solid #fff', borderBottomColor: 'transparent'}}></div>;

            export default function PromptBuilder() {
                const [generatedPrompt, setGeneratedPrompt] = useState('');
                const [aiResponse, setAiResponse] = useState('');
                const [isLoading, setIsLoading] = useState(false);

                const getGenericPrompt = () => {
                    let p = '';
                    const persona = (document.getElementById('generic-persona') as HTMLInputElement).value;
                    const task = (document.getElementById('generic-task') as HTMLInputElement).value;
                    const context = (document.getElementById('generic-context') as HTMLTextAreaElement).value;
                    const format = (document.getElementById('generic-format') as HTMLInputElement).value;
                    if (persona) p += `Act as ${persona}. `;
                    if (task) p += `Your task: ${task}. `;
                    if (context) p += `Context: ${context}. `;
                    if (format) p += `Format: ${format}.`;
                    return p.trim();
                };
                
                const handleGenerate = async () => {
                    const prompt = getGenericPrompt();
                    setGeneratedPrompt(prompt);
                    setIsLoading(true);
                    setAiResponse('');
                    setTimeout(() => {
                        setAiResponse(`This is a simulated AI response for the prompt: "' + prompt + '"`);
                        setIsLoading(false);
                    }, 2000);
                };

                return (
                    <section id="generator" className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
                        <h2 className="text-4xl font-bold text-primary-600 dark:text-indigo-300 mb-4">Prompt Builder</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">Craft your prompt below, then click Generate to get a response from the AI.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="generic-persona" className="block text-sm font-medium text-gray-700 dark:text-gray-400">Persona</label>
                                <input id="generic-persona" type="text" className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500/50 bg-gray-50 dark:bg-gray-700" placeholder="e.g., A witty historian" />
                            </div>
                            <div>
                                <label htmlFor="generic-task" className="block text-sm font-medium text-gray-700 dark:text-gray-400">Task</label>
                                <input id="generic-task" type="text" className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500/50 bg-gray-50 dark:bg-gray-700" placeholder="e.g., Explain the fall of Rome" />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="generic-context" className="block text-sm font-medium text-gray-700 dark:text-gray-400">Context</label>
                                <textarea id="generic-context" rows={4} className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500/50 bg-gray-50 dark:bg-gray-700" placeholder="Background info or examples"></textarea>
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="generic-format" className="block text-sm font-medium text-gray-700 dark:text-gray-400">Format</label>
                                <input id="generic-format" type="text" className="mt-1 block w-full rounded-lg border-gray-300 dark:border-gray-600 focus:border-primary-500 focus:ring-primary-500/50 bg-gray-50 dark:bg-gray-700" placeholder="e.g., Three bullet points" />
                            </div>
                            <div className="md:col-span-2 flex justify-end">
                                <button type="button" onClick={handleGenerate} disabled={isLoading} className="px-6 py-3 bg-primary-600 text-white rounded-lg shadow hover:bg-primary-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition disabled:opacity-50 flex items-center justify-center w-48">
                                    {isLoading ? <Loader /> : '✨ Generate Response'}
                                </button>
                            </div>
                        </div>
                        {generatedPrompt && (
                            <div className="mt-8 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 shadow">
                                <h3 className="font-semibold text-lg">Generated Prompt</h3>
                                <pre className="whitespace-pre-wrap text-sm mt-2">{generatedPrompt}</pre>
                            </div>
                        )}
                        {aiResponse && (
                            <div className="mt-8 bg-sky-50 dark:bg-sky-900/50 p-6 rounded-lg border border-sky-200 dark:border-sky-800 text-slate-700 dark:text-slate-300 space-y-4">
                                <h3 className="text-2xl font-bold">✨ AI Response</h3>
                                <p>{aiResponse}</p>
                            </div>
                        )}
                    </section>
                );
            }
        """
    }
    
    for path, content in interactive_components.items():
        with open(path, "w", encoding="utf-8") as f:
            f.write(textwrap.dedent(content).strip())
        print(f"  - Successfully created: {path}")

    return True


if __name__ == "__main__":
    print("Starting project setup...")
    if (create_project_structure() and
        create_package_json() and 
        create_config_files() and 
        create_base_styles_and_layout() and 
        create_page_and_components()):
        
        print("\\nProject setup complete!")
        print("Please run 'npm install' and then 'npm run dev'.")
    else:
        print("\\nProject setup failed due to a configuration error.")
