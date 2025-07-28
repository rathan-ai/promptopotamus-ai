'use client';

import { PromptCoinDisplay, PromptCoinSymbol } from '@/components/ui/PromptCoinDisplay';
import { PromptCoinCharSymbol } from '@/components/ui/PromptCoinSymbol';
import { Coins } from 'lucide-react';

export default function PromptCoinSymbolDemo() {
  return (
    <div className="max-w-4xl mx-auto p-8 space-y-8">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">PromptCoin Symbol Options</h1>
      
      {/* Current Implementation */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold dark:text-white">Current Symbol (Coins Icon)</h2>
        <div className="grid grid-cols-5 gap-4 p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="text-center">
            <p className="text-sm text-neutral-500 mb-2">XS</p>
            <PromptCoinDisplay amount={100} size="xs" symbolType="coin" />
          </div>
          <div className="text-center">
            <p className="text-sm text-neutral-500 mb-2">SM</p>
            <PromptCoinDisplay amount={100} size="sm" symbolType="coin" />
          </div>
          <div className="text-center">
            <p className="text-sm text-neutral-500 mb-2">MD</p>
            <PromptCoinDisplay amount={100} size="md" symbolType="coin" />
          </div>
          <div className="text-center">
            <p className="text-sm text-neutral-500 mb-2">LG</p>
            <PromptCoinDisplay amount={100} size="lg" symbolType="coin" />
          </div>
          <div className="text-center">
            <p className="text-sm text-neutral-500 mb-2">XL</p>
            <PromptCoinDisplay amount={100} size="xl" symbolType="coin" />
          </div>
        </div>
      </section>

      {/* New Custom Symbol */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold dark:text-white">New Custom Symbol (Default)</h2>
        <div className="grid grid-cols-5 gap-4 p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="text-center">
            <p className="text-sm text-neutral-500 mb-2">XS</p>
            <PromptCoinDisplay amount={100} size="xs" />
          </div>
          <div className="text-center">
            <p className="text-sm text-neutral-500 mb-2">SM</p>
            <PromptCoinDisplay amount={100} size="sm" />
          </div>
          <div className="text-center">
            <p className="text-sm text-neutral-500 mb-2">MD</p>
            <PromptCoinDisplay amount={100} size="md" />
          </div>
          <div className="text-center">
            <p className="text-sm text-neutral-500 mb-2">LG</p>
            <PromptCoinDisplay amount={100} size="lg" />
          </div>
          <div className="text-center">
            <p className="text-sm text-neutral-500 mb-2">XL</p>
            <PromptCoinDisplay amount={100} size="xl" />
          </div>
        </div>
      </section>

      {/* Symbol Variants */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold dark:text-white">Symbol Variants</h2>
        <div className="grid grid-cols-3 gap-6">
          <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <h3 className="font-medium mb-4 dark:text-white">Default</h3>
            <div className="flex items-center gap-4">
              <PromptCoinSymbol className="w-12 h-12 text-amber-600" />
              <PromptCoinDisplay amount={1000} size="lg" />
            </div>
          </div>
          
          <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <h3 className="font-medium mb-4 dark:text-white">Gradient</h3>
            <div className="flex items-center gap-4">
              <PromptCoinSymbol variant="gradient" className="w-12 h-12" />
              <span className="text-lg font-bold text-amber-600">1,000</span>
            </div>
          </div>
          
          <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <h3 className="font-medium mb-4 dark:text-white">Simple Text</h3>
            <div className="flex items-center gap-4">
              <PromptCoinSymbol variant="simple" className="text-4xl text-amber-600" />
              <span className="text-lg font-bold text-amber-600">1,000</span>
            </div>
          </div>
        </div>
      </section>

      {/* Alternative Characters */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold dark:text-white">Alternative Character Options</h2>
        <div className="grid grid-cols-2 gap-6">
          <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <h3 className="font-medium mb-4 dark:text-white">Latin P with Stroke (Ᵽ)</h3>
            <div className="flex items-center gap-4">
              <PromptCoinCharSymbol className="text-4xl text-amber-600" />
              <span className="text-lg font-bold text-amber-600">1,000</span>
            </div>
            <p className="text-sm text-neutral-500 mt-2">Unicode: U+2C63</p>
          </div>
          
          <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <h3 className="font-medium mb-4 dark:text-white">Text Combination</h3>
            <div className="flex items-center gap-4">
              <span className="text-4xl font-bold text-amber-600">₱C</span>
              <span className="text-lg font-bold text-amber-600">1,000</span>
            </div>
            <p className="text-sm text-neutral-500 mt-2">Peso symbol + C</p>
          </div>
        </div>
      </section>

      {/* Usage Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold dark:text-white">Usage Examples</h2>
        <div className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Balance Display</p>
            <PromptCoinDisplay amount={5420} size="xl" variant="success" showLabel />
          </div>
          
          <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Price Display</p>
            <PromptCoinDisplay amount={299} size="lg" />
          </div>
          
          <div className="p-4 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">Transaction List</p>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Smart Prompt Purchase</span>
                <PromptCoinDisplay amount={-50} size="sm" variant="warning" />
              </div>
              <div className="flex justify-between">
                <span>PromptCoin Top-up</span>
                <PromptCoinDisplay amount={1000} size="sm" variant="success" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold dark:text-white">Side-by-Side Comparison</h2>
        <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 dark:border-neutral-700">
                <th className="text-left py-2">Context</th>
                <th className="text-center py-2">Old (Coins)</th>
                <th className="text-center py-2">New (Custom)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
              <tr>
                <td className="py-3">Button</td>
                <td className="text-center">
                  <button className="bg-blue-500 text-white px-4 py-2 rounded inline-flex items-center gap-2">
                    Buy <Coins className="w-4 h-4" /> 100
                  </button>
                </td>
                <td className="text-center">
                  <button className="bg-blue-500 text-white px-4 py-2 rounded inline-flex items-center gap-2">
                    Buy <PromptCoinSymbol className="w-4 h-4" /> 100
                  </button>
                </td>
              </tr>
              <tr>
                <td className="py-3">Inline Text</td>
                <td className="text-center">
                  Price: <PromptCoinDisplay amount={50} size="sm" symbolType="coin" />
                </td>
                <td className="text-center">
                  Price: <PromptCoinDisplay amount={50} size="sm" />
                </td>
              </tr>
              <tr>
                <td className="py-3">Large Display</td>
                <td className="text-center">
                  <PromptCoinDisplay amount={9999} size="xl" symbolType="coin" />
                </td>
                <td className="text-center">
                  <PromptCoinDisplay amount={9999} size="xl" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}