'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { DollarSign, Loader2, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

interface RecipePurchaseButtonProps {
  recipeId: number;
  price: number;
  title: string;
  sellerName: string;
  onPurchaseSuccess?: () => void;
  className?: string;
}

export default function RecipePurchaseButton({
  recipeId,
  price,
  title,
  sellerName,
  onPurchaseSuccess,
  className = ''
}: RecipePurchaseButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    setIsLoading(true);

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
      console.error('Purchase error:', error);
      toast.error('Purchase failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // If free recipe
  if (price === 0) {
    return (
      <Button
        onClick={handlePurchase}
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

  // Paid recipe
  return (
    <Button
      onClick={handlePurchase}
      disabled={isLoading}
      className={`w-full ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          <DollarSign className="w-4 h-4 mr-2" />
          Buy for ${price.toFixed(2)}
        </>
      )}
    </Button>
  );
}
