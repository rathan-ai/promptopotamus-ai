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