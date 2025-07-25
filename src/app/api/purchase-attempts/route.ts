import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { UniversalPaymentAdapter } from '@/lib/payment-adapter';
import { getCurrentUser } from '@/lib/auth';
import { QUIZ_CONFIG } from '@/config/constants';

export async function POST(req: Request) {
    const supabase = await createServerClient();
    const user = await getCurrentUser(supabase);

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { level, paymentIntentId } = await req.json();
    if (!level) {
        return NextResponse.json({ error: 'Level not specified.' }, { status: 400 });
    }

    if (!paymentIntentId) {
        return NextResponse.json({ error: 'Payment intent ID not provided.' }, { status: 400 });
    }
    
    try {
        // Initialize payment adapter
        const paymentAdapter = new UniversalPaymentAdapter();
        
        // Verify payment status
        const paymentStatus = await paymentAdapter.getPaymentStatus(paymentIntentId);
        
        if (paymentStatus.status !== 'succeeded' && paymentStatus.status !== 'completed') {
            return NextResponse.json({ 
                error: 'Payment not completed. Please complete payment first.' 
            }, { status: 400 });
        }

        // Check if this payment has already been processed
        const { data: existingPurchase } = await supabase
            .from('quiz_purchases')
            .select('id')
            .eq('payment_intent_id', paymentIntentId)
            .single();

        if (existingPurchase) {
            return NextResponse.json({ 
                error: 'This payment has already been processed.' 
            }, { status: 400 });
        }

        // Record the purchase
        const { error: purchaseError } = await supabase
            .from('quiz_purchases')
            .insert({
                user_id: user.id,
                payment_intent_id: paymentIntentId,
                level: level,
                attempts_purchased: QUIZ_CONFIG.ATTEMPTS_PER_PURCHASE,
                amount: QUIZ_CONFIG.ATTEMPT_PRICE
            });

        if (purchaseError) {
            console.error('Failed to record purchase:', purchaseError);
            return NextResponse.json({ 
                error: 'Failed to record purchase. Please contact support.' 
            }, { status: 500 });
        }

        // Update user's purchased attempts
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('purchased_attempts')
            .eq('id', user.id)
            .single();

        if (profileError) {
            return NextResponse.json({ error: 'Could not find user profile.' }, { status: 500 });
        }

        const newPurchasedAttempts = profile.purchased_attempts || {};
        newPurchasedAttempts[level] = (newPurchasedAttempts[level] || 0) + QUIZ_CONFIG.ATTEMPTS_PER_PURCHASE;

        const { error: updateError } = await supabase
            .from('profiles')
            .update({ purchased_attempts: newPurchasedAttempts })
            .eq('id', user.id);

        if (updateError) {
            return NextResponse.json({ error: 'Failed to update attempts.' }, { status: 500 });
        }

        return NextResponse.json({ 
            success: true, 
            message: `Successfully purchased ${QUIZ_CONFIG.ATTEMPTS_PER_PURCHASE} more attempts!`,
            attemptsAdded: QUIZ_CONFIG.ATTEMPTS_PER_PURCHASE
        });
        
    } catch (error) {
        console.error('Error processing quiz attempt purchase:', error);
        return NextResponse.json({ 
            error: 'Failed to process purchase. Please try again.' 
        }, { status: 500 });
    }
}

// GET endpoint to initiate payment for quiz attempts
export async function GET(req: Request) {
    const supabase = await createServerClient();
    const user = await getCurrentUser(supabase);

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const level = searchParams.get('level');
    
    if (!level) {
        return NextResponse.json({ error: 'Level not specified.' }, { status: 400 });
    }

    try {
        // Initialize payment adapter
        const paymentAdapter = new UniversalPaymentAdapter();
        
        // Create payment intent
        const paymentResponse = await paymentAdapter.createPayment({
            amount: QUIZ_CONFIG.ATTEMPT_PRICE,
            currency: QUIZ_CONFIG.DEFAULT_CURRENCY,
            description: `${QUIZ_CONFIG.ATTEMPTS_PER_PURCHASE} quiz attempts for ${level} level`,
            metadata: {
                userId: user.id,
                level: level,
                type: 'quiz_attempts',
                attempts: QUIZ_CONFIG.ATTEMPTS_PER_PURCHASE
            },
            userId: user.id
        });

        if (!paymentResponse.success) {
            return NextResponse.json({ 
                error: paymentResponse.error || 'Failed to create payment' 
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            clientSecret: paymentResponse.clientSecret,
            paymentIntentId: paymentResponse.transactionId,
            amount: QUIZ_CONFIG.ATTEMPT_PRICE,
            attempts: QUIZ_CONFIG.ATTEMPTS_PER_PURCHASE
        });
        
    } catch (error) {
        console.error('Error creating payment intent:', error);
        return NextResponse.json({ 
            error: 'Failed to create payment. Please try again.' 
        }, { status: 500 });
    }
}