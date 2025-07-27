import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { serverPaymentService } from '@/features/payments/services/payment-service';

// Create PromptCoin package purchase
export async function POST(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { packageId, paymentProvider = 'paypal', transactionId, amount } = await req.json();

    if (!packageId) {
      return NextResponse.json({ error: 'Package ID is required' }, { status: 400 });
    }

    const pkg = serverPaymentService.getPackageById(packageId);
    if (!pkg) {
      return NextResponse.json({ error: 'Invalid package ID' }, { status: 400 });
    }

    // Validate amount matches package price
    if (amount && Math.abs(amount - pkg.price) > 0.01) {
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
    }

    // Extract PromptCoins from package string (e.g., "500 PC" -> 500)
    const promptCoinsAmount = parseInt(pkg.promptCoins.replace(/[^\d]/g, ''));
    const perCategory = Math.floor(promptCoinsAmount / 4);
    const promptCoinsToAdd = {
      analysis: perCategory,
      enhancement: perCategory,
      exam: perCategory,
      export: promptCoinsAmount - (perCategory * 3) // remainder goes to export
    };

    // Add PromptCoins to user account using the service
    const success = await serverPaymentService.addPromptCoinsFromPayment(
      user.id,
      promptCoinsToAdd,
      paymentProvider,
      transactionId || `pc_${Date.now()}`,
      pkg.price
    );

    if (!success) {
      return NextResponse.json({ 
        error: 'Failed to add PromptCoins to account' 
      }, { status: 500 });
    }

    // Transaction logging is handled by the payment service

    return NextResponse.json({
      success: true,
      message: `Successfully purchased ${pkg.name}!`,
      package: {
        id: pkg.id,
        name: pkg.name,
        promptCoins: promptCoinsAmount,
        price: pkg.price
      },
      promptCoinsAdded: promptCoinsToAdd,
      totalPromptCoins: promptCoinsAmount
    });

  } catch (error) {
    console.error('Error processing PromptCoin purchase:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Get available PromptCoin packages
export async function GET() {
  return NextResponse.json({
    packages: serverPaymentService.getPromptCoinPackages(),
    conversionRate: {
      description: '100 PromptCoins = $1 USD',
      rate: 100
    }
  });
}