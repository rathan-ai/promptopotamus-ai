import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { addPromptCoinsFromPayment } from '@/lib/subscription';

const PROMPTCOIN_PACKAGES = {
  starter: {
    id: 'starter',
    name: 'Starter Pack',
    price: 5,
    promptCoins: 500,
    description: 'Perfect for getting started with AI prompting'
  },
  pro: {
    id: 'pro',
    name: 'Pro Pack',
    price: 20,
    promptCoins: 2000,
    description: 'Ideal for professionals and active users'
  },
  premium: {
    id: 'premium',
    name: 'Premium Pack',
    price: 50,
    promptCoins: 5000,
    description: 'Perfect for power users and teams'
  }
};

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

    const pkg = PROMPTCOIN_PACKAGES[packageId as keyof typeof PROMPTCOIN_PACKAGES];
    if (!pkg) {
      return NextResponse.json({ error: 'Invalid package ID' }, { status: 400 });
    }

    // Validate amount matches package price
    if (amount && Math.abs(amount - pkg.price) > 0.01) {
      return NextResponse.json({ error: 'Amount mismatch' }, { status: 400 });
    }

    // Distribute PromptCoins evenly across categories
    const promptCoinsAmount = pkg.promptCoins;
    const perCategory = Math.floor(promptCoinsAmount / 4);
    const promptCoinsToAdd = {
      analysis: perCategory,
      enhancement: perCategory,
      exam: perCategory,
      export: promptCoinsAmount - (perCategory * 3) // remainder goes to export
    };

    // Add PromptCoins to user account
    const success = await addPromptCoinsFromPayment(
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

    // Log the purchase for analytics
    try {
      await supabase
        .from('promptcoin_transactions')
        .insert({
          user_id: user.id,
          type: 'purchase',
          analysis_amount: promptCoinsToAdd.analysis,
          enhancement_amount: promptCoinsToAdd.enhancement,
          exam_amount: promptCoinsToAdd.exam,
          export_amount: promptCoinsToAdd.export,
          description: `${pkg.name} purchase`,
          transaction_id: transactionId || `pc_${Date.now()}`,
          payment_amount: pkg.price,
          payment_provider: paymentProvider
        });
    } catch (logError) {
      // Log error but don't fail the request since PromptCoins were added
      console.error('Error logging transaction:', logError);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully purchased ${pkg.name}!`,
      package: {
        id: pkg.id,
        name: pkg.name,
        promptCoins: pkg.promptCoins,
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
    packages: Object.values(PROMPTCOIN_PACKAGES),
    conversionRate: {
      description: '100 PromptCoins = $1 USD',
      rate: 100
    }
  });
}