'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { DollarSign, Coins, Loader2, ShoppingCart } from 'lucide-react';
import { usdToPromptCoins } from '@/lib/subscription';
import toast from 'react-hot-toast';

interface RecipePurchaseButtonProps {
  recipeId: number;
  price: number;
  title: string;
  sellerName: string;
  userPromptCoins?: number;
  onPurchaseSuccess?: () => void;
  className?: string;
}

export default function RecipePurchaseButton({
  recipeId,
  price,
  title,
  sellerName,
  userPromptCoins = 0,
  onPurchaseSuccess,
  className = ''
}: RecipePurchaseButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [purchaseMethod, setPurchaseMethod] = useState<'usd' | 'promptcoins' | null>(null);

  const promptCoinPrice = usdToPromptCoins(price);
  const hasEnoughPromptCoins = userPromptCoins >= promptCoinPrice;

  const handlePromptCoinPurchase = async () => {
    if (!hasEnoughPromptCoins) {
      toast.error(`You need ${promptCoinPrice} PromptCoins but only have ${userPromptCoins} PC. Buy more PromptCoins to continue.`);
      return;
    }

    setIsLoading(true);
    setPurchaseMethod('promptcoins');

    try {
      const response = await fetch('/api/smart-prompts/purchase-promptcoins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptId: recipeId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.insufficientFunds) {
          toast.error(data.error || 'Insufficient PromptCoins');
        } else {
          toast.error(data.error || 'Purchase failed');
        }
        return;
      }

      toast.success(data.message || 'Recipe purchased successfully!');
      onPurchaseSuccess?.();

    } catch (error) {
      console.error('PromptCoin purchase error:', error);
      toast.error('Purchase failed. Please try again.');
    } finally {
      setIsLoading(false);
      setPurchaseMethod(null);
    }
  };

  const handleUsdPurchase = async () => {
    setIsLoading(true);
    setPurchaseMethod('usd');

    try {
      const response = await fetch('/api/smart-prompts/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          promptId: recipeId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || 'Purchase failed');
        return;
      }

      if (data.free) {
        toast.success(data.message || 'Free recipe added to your collection!');
        onPurchaseSuccess?.();
        return;
      }

      // Handle paid purchase - redirect to payment
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        toast.error('Payment setup failed');
      }

    } catch (error) {
      console.error('USD purchase error:', error);
      toast.error('Purchase failed. Please try again.');
    } finally {
      setIsLoading(false);
      setPurchaseMethod(null);
    }
  };

  // If free recipe
  if (price === 0) {
    return (
      <Button
        onClick={handleUsdPurchase}
        disabled={isLoading}
        className={`w-full ${className}`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Adding...
          </>
        ) : (
          <>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Get Free Recipe
          </>
        )}
      </Button>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Purchase with PromptCoins */}
      <Button
        onClick={handlePromptCoinPurchase}
        disabled={isLoading || !hasEnoughPromptCoins}
        className={`w-full ${
          hasEnoughPromptCoins 
            ? 'bg-amber-600 hover:bg-amber-700 text-white' 
            : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 cursor-not-allowed'
        }`}
        variant={hasEnoughPromptCoins ? "default" : "outline"}
      >
        {isLoading && purchaseMethod === 'promptcoins' ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Purchasing...
          </>
        ) : (
          <>
            <Coins className="w-4 h-4 mr-2" />
            Buy with {promptCoinPrice} PromptCoins
            {!hasEnoughPromptCoins && (
              <span className="ml-1 text-xs">
                (Need {promptCoinPrice - userPromptCoins} more)
              </span>
            )}
          </>
        )}
      </Button>

      {/* Or divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-neutral-200 dark:border-neutral-700"></div>
        <span className="text-xs text-neutral-500 dark:text-neutral-400">or</span>
        <div className="flex-1 border-t border-neutral-200 dark:border-neutral-700"></div>
      </div>

      {/* Purchase with USD */}
      <Button
        onClick={handleUsdPurchase}
        disabled={isLoading}
        variant="outline"
        className="w-full"
      >
        {isLoading && purchaseMethod === 'usd' ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <DollarSign className="w-4 h-4 mr-2" />
            Buy with ${price} USD
          </>
        )}
      </Button>

      {/* User's PromptCoin balance info */}
      <div className="text-xs text-center text-neutral-500 dark:text-neutral-400">
        Your balance: {userPromptCoins} PromptCoins
        {!hasEnoughPromptCoins && (
          <span className="block text-amber-600 dark:text-amber-400 mt-1">
            Need {promptCoinPrice - userPromptCoins} more PromptCoins
          </span>
        )}
      </div>
    </div>
  );
}