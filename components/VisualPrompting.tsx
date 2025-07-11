import React from 'react';

export default function VisualPrompting() {
  const contentHtml = `<p className="text-lg text-gray-600 dark:text-gray-300 mb-6">Modern LLMs are often multimodal, meaning they can understand and process more than just text. You can include images in your prompts to provide richer context and get more nuanced responses.</p><div className="p-6 bg-gray-50 dark:bg-gray-700 rounded-xl shadow"><h4 className="font-medium mb-2">Example: Image-based Storytelling</h4><p className="text-gray-600 dark:text-gray-400 mb-4">Upload an image and ask the AI to use it as inspiration.</p><pre className="bg-white dark:bg-gray-800 p-4 rounded overflow-x-auto text-sm"><code>\n\nWrite a short, suspenseful story that begins with this scene.</code></pre></div>`;
  return (
    <section id="visual-prompting" className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg">
      <h2 className="text-3xl font-semibold mb-6">Visual Prompting</h2>
      <div className="prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: contentHtml.replace(/\\n/g, '<br />') }} />
    </section>
  );
}