'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Coins, TrendingUp, TrendingDown, Download, Filter, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/Loading';
import { PromptCoinBalance } from '@/components/ui/PromptCoinDisplay';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

interface PromptCoinTransaction {
  id: number;
  transaction_type: string;
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;
}

export default function PromptCoinHistoryPage() {
  const [transactions, setTransactions] = useState<PromptCoinTransaction[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'purchase' | 'spend'>('all');
  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          toast.error('Please log in to view your transaction history');
          return;
        }

        // Fetch balance and transactions
        const [balanceRes, transactionsRes] = await Promise.all([
          fetch('/api/user/balance'),
          fetch('/api/user/promptcoin-transactions')
        ]);

        if (balanceRes.ok) {
          const balanceData = await balanceRes.json();
          setBalance(balanceData.balance || 0);
        }

        if (transactionsRes.ok) {
          const transactionsData = await transactionsRes.json();
          setTransactions(transactionsData.transactions || []);
        } else {
          toast.error('Failed to load transaction history');
        }
      } catch (error) {
        console.error('Error fetching PromptCoin data:', error);
        toast.error('Network error loading transaction history');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [supabase.auth]);

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'purchase') return transaction.amount > 0;
    if (filter === 'spend') return transaction.amount < 0;
    return true;
  });

  const exportTransactions = () => {
    const csvContent = [
      ['Date', 'Time', 'Type', 'Description', 'Amount', 'Balance After'],
      ...filteredTransactions.map(t => [
        new Date(t.created_at).toLocaleDateString(),
        new Date(t.created_at).toLocaleTimeString(),
        t.transaction_type,
        t.description,
        t.amount.toString(),
        t.balance_after.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `promptcoin-history-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success('Transaction history exported successfully!');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard#promptcoins" className="inline-flex items-center text-sm text-neutral-600 dark:text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-4xl font-bold dark:text-white mb-2">
              PromptCoin History
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-400">
              Complete transaction history and balance details
            </p>
          </div>
          
          {/* Current Balance */}
          <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 p-6 rounded-lg border border-amber-200 dark:border-amber-700">
            <div className="flex items-center gap-3">
              <Coins className="w-8 h-8 text-amber-500" />
              <div>
                <p className="text-sm text-amber-600 dark:text-amber-400 mb-1">Current Balance</p>
                <PromptCoinBalance amount={balance} size="lg" />
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between bg-white dark:bg-neutral-800 p-4 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-neutral-500" />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Filter:</span>
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'purchase' | 'spend')}
              className="px-3 py-1 border border-neutral-300 dark:border-neutral-600 rounded-md text-sm bg-white dark:bg-neutral-700 dark:text-white"
            >
              <option value="all">All Transactions</option>
              <option value="purchase">Purchases Only</option>
              <option value="spend">Spending Only</option>
            </select>
          </div>
          
          <Button
            onClick={exportTransactions}
            variant="outline"
            size="sm"
            disabled={filteredTransactions.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        {filteredTransactions.length > 0 ? (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="p-6 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${
                      transaction.amount > 0
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.amount > 0 ? 
                        <TrendingUp className="w-5 h-5" /> : 
                        <TrendingDown className="w-5 h-5" />
                      }
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-neutral-900 dark:text-white">
                        {transaction.description}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(transaction.created_at).toLocaleDateString()}
                        </span>
                        <span>{new Date(transaction.created_at).toLocaleTimeString()}</span>
                        <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded text-xs font-medium">
                          {transaction.transaction_type}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      transaction.amount > 0
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}{transaction.amount} PC
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Balance: {transaction.balance_after} PC
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Coins className="w-16 h-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
              {filter === 'all' ? 'No transactions yet' : `No ${filter} transactions`}
            </h3>
            <p className="text-neutral-500 dark:text-neutral-400 mb-6">
              {filter === 'all' 
                ? 'Your PromptCoin transaction history will appear here'
                : `No ${filter} transactions found. Try changing the filter.`
              }
            </p>
            {filter === 'all' && (
              <Link href="/purchase">
                <Button>
                  <Coins className="w-4 h-4 mr-2" />
                  Buy PromptCoins
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {filteredTransactions.length > 0 && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700 text-center">
            <h3 className="text-lg font-semibold mb-2 dark:text-white">Total Transactions</h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{filteredTransactions.length}</p>
          </div>
          
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700 text-center">
            <h3 className="text-lg font-semibold mb-2 dark:text-white">Total Purchased</h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              +{filteredTransactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0)} PC
            </p>
          </div>
          
          <div className="bg-white dark:bg-neutral-800 p-6 rounded-lg border border-neutral-200 dark:border-neutral-700 text-center">
            <h3 className="text-lg font-semibold mb-2 dark:text-white">Total Spent</h3>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {filteredTransactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)} PC
            </p>
          </div>
        </div>
      )}
    </div>
  );
}