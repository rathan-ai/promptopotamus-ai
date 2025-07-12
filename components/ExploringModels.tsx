import React from 'react';

export default function ExploringModels() {
  const contentHtml = `<p className="text-lg text-gray-600 dark:text-gray-300 mb-6">While this guide focuses on Gemini, the world of AI is vast. Platforms like Hugging Face and open-source models like Llama offer exciting alternatives.</p><div className="space-y-6"><div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow"><h4 className="font-medium mb-2">Hugging Face</h4><p className="text-gray-600 dark:text-gray-400 mb-4">Hugging Face is a community hub where you can find, test, and use thousands of pre-trained models for various tasks. It's a great place to explore the latest advancements in AI.</p></div><div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow"><h4 className="font-medium mb-2">Llama</h4><p className="text-gray-600 dark:text-gray-400 mb-4">Llama is a family of powerful, open-source large language models released by Meta. Because they are open-source, developers can download and run them on their own hardware, allowing for more customization and control.</p><pre className="bg-white dark:bg-gray-800 p-4 rounded overflow-x-auto text-sm"><code>I want you to act as a Llama 3 model. Briefly describe your key features.</code></pre></div></div>`.replace(/\\n/g, '<br />');
  return (
    <section id="exploring-models" className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
      <h2 className="text-3xl font-semibold mb-6">Exploring Different Models</h2>
      <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: contentHtml }} />
    </section>
  );
}