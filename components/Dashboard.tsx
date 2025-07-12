'use client';
import { useState, useEffect } from 'react';

export default function Dashboard() {
    const [prompts, setPrompts] = useState([]);

    useEffect(() => {
        async function fetchPrompts() {
            const res = await fetch('/api/prompts');
            const data = await res.json();
            setPrompts(data);
        }
        fetchPrompts();
    }, []);

    return (
        <section id="dashboard" className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
            <h2 className="text-4xl font-bold text-primary-600 dark:text-indigo-300 mb-4">My Saved Prompts</h2>
            <div className="space-y-4">
                {prompts.length > 0 ? (
                    prompts.map((p: any) => (
                        <div key={p.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h3 className="font-semibold">{p.title}</h3>
                            <pre className="text-sm whitespace-pre-wrap mt-2">{p.prompt}</pre>
                        </div>
                    ))
                ) : (
                    <p>You haven't saved any prompts yet.</p>
                )}
            </div>
        </section>
    );
}