import React from 'react';

export default function BasicTechniques() {
  const contentHtml = `<div className="grid md:grid-cols-2 gap-6"><article className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow"><h4 className="font-medium mb-2">Zero-Shot Prompting</h4><p className="text-gray-600 dark:text-gray-400 mb-4">The simplest prompt type: description only, no examples.</p><pre className="bg-white dark:bg-gray-800 p-4 rounded overflow-x-auto text-sm"><code>Classify the following movie review as POSITIVE, NEUTRAL, or NEGATIVE.\n\nReview: "Her" is a disturbing masterpiece. I wish there were more movies like this.\nSentiment:</code></pre></article><article className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow"><h4 className="font-medium mb-2">One-Shot & Few-Shot Prompting</h4><p className="text-gray-600 dark:text-gray-400 mb-4">Provide one (one-shot) or multiple (few-shot) examples to teach the model a pattern.</p><pre className="bg-white dark:bg-gray-800 p-4 rounded overflow-x-auto text-sm"><code>Parse the pizza order into JSON.\n\nEXAMPLE:\nI want a small pizza with cheese and pepperoni.\nJSON: {"size": "small", "ingredients": ["cheese", "pepperoni"]}\n\nNow, I would like a medium pizza with mushrooms.\nJSON:</code></pre></article></div>`;
  return (
    <section id="basic-techniques" className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
      <h2 className="text-3xl font-semibold mb-6">Basic Prompting Techniques</h2>
      <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: contentHtml.replace(/\\n/g, '<br />') }} />
    </section>
  );
}