import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { purchaseRecipeWithPromptCoins, usdToPromptCoins } from '@/lib/subscription';

// Rate limiting cache (in production, use Redis)
const rateLimitCache = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const key = `promptcoin_purchase_${userId}`;
  const limit = rateLimitCache.get(key);
  
  if (!limit || now > limit.resetTime) {
    // Reset limit (5 purchases per minute)
    rateLimitCache.set(key, { count: 1, resetTime: now + 60000 });
    return true;
  }
  
  if (limit.count >= 5) {
    return false;
  }
  
  limit.count++;
  return true;
}

function validateInput(data: any): { valid: boolean; error?: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }
  
  const { promptId } = data;
  
  if (!promptId || typeof promptId !== 'number' || promptId <= 0) {
    return { valid: false, error: 'Invalid prompt ID' };
  }
  
  // Additional security validations
  if (promptId > 2147483647) { // Max int32
    return { valid: false, error: 'Invalid prompt ID range' };
  }
  
  return { valid: true };
}

function detectFraudulentActivity(userId: string, promptCoinPrice: number): { suspicious: boolean; reason?: string } {
  // Check for unusually high-value purchases (>$50 worth)
  if (promptCoinPrice > 5000) {
    return { suspicious: true, reason: 'High-value purchase detected' };
  }
  
  // Check purchase velocity (basic in-memory check)
  const now = Date.now();
  const key = `purchase_velocity_${userId}`;
  const recent = rateLimitCache.get(key);
  
  if (recent && recent.resetTime > now && recent.count >= 3) {
    return { suspicious: true, reason: 'Rapid purchase velocity detected' };
  }
  
  return { suspicious: false };
}

export async function POST(req: Request) {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limiting
  if (!checkRateLimit(user.id)) {
    // Log rate limit violation
    await supabase.rpc('log_payment_security_event', {
      p_user_id: user.id,
      p_event_type: 'rate_limit_exceeded',
      p_severity: 'high',
      p_error_message: 'PromptCoin purchase rate limit exceeded'
    });
    
    return NextResponse.json({ error: 'Too many requests. Please wait before trying again.' }, { status: 429 });
  }

  try {
    const requestData = await req.json();
    
    // Input validation
    const validation = validateInput(requestData);
    if (!validation.valid) {
      await supabase.rpc('log_payment_security_event', {
        p_user_id: user.id,
        p_event_type: 'invalid_input',
        p_severity: 'medium',
        p_error_message: validation.error,
        p_request_data: requestData
      });
      
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }
    
    const { promptId } = requestData;

    if (!promptId) {
      return NextResponse.json({ error: 'Prompt ID is required' }, { status: 400 });
    }

    // Get prompt details
    const { data: prompt, error: promptError } = await supabase
      .from('saved_prompts')
      .select(`
        id,
        title,
        description,
        price,
        user_id,
        profiles!saved_prompts_user_id_fkey(full_name)
      `)
      .eq('id', promptId)
      .eq('is_marketplace', true)
      .eq('is_public', true)
      .single();

    if (promptError || !prompt) {
      // Log security event for invalid recipe access
      await supabase.rpc('log_payment_security_event', {
        p_user_id: user.id,
        p_event_type: 'invalid_recipe_access',
        p_severity: 'medium',
        p_error_message: 'Attempted to purchase non-existent or private recipe',
        p_request_data: { prompt_id: promptId }
      });
      
      return NextResponse.json({ error: 'Recipe not found' }, { status: 404 });
    }

    // Check if user is trying to buy their own prompt
    if (prompt.user_id === user.id) {
      // Log security event for self-purchase attempt
      await supabase.rpc('log_payment_security_event', {
        p_user_id: user.id,
        p_event_type: 'self_purchase_attempt',
        p_severity: 'medium',
        p_error_message: 'User attempted to purchase their own recipe',
        p_request_data: { prompt_id: promptId, owner_id: prompt.user_id }
      });
      
      return NextResponse.json({ error: 'You cannot purchase your own recipe' }, { status: 400 });
    }

    // Check if user has already purchased this prompt
    const { data: existingPurchase } = await supabase
      .from('smart_prompt_purchases')
      .select('id')
      .eq('prompt_id', promptId)
      .eq('buyer_id', user.id)
      .single();

    if (existingPurchase) {
      // Log security event for duplicate purchase attempt
      await supabase.rpc('log_payment_security_event', {
        p_user_id: user.id,
        p_event_type: 'duplicate_purchase_attempt',
        p_severity: 'low',
        p_error_message: 'User attempted to purchase already owned recipe',
        p_request_data: { prompt_id: promptId, existing_purchase_id: existingPurchase.id }
      });
      
      return NextResponse.json({ error: 'You have already purchased this recipe' }, { status: 400 });
    }

    // If prompt is free, create purchase record directly (no PromptCoins needed)
    if (!prompt.price || prompt.price === 0) {
      const { error: purchaseError } = await supabase
        .from('smart_prompt_purchases')
        .insert({
          prompt_id: promptId,
          buyer_id: user.id,
          seller_id: prompt.user_id,
          purchase_price: 0,
          promptcoins_used: 0,
          payment_provider: 'free',
          purchased_at: new Date().toISOString()
        });

      if (purchaseError) {
        // Log critical error for free purchase failure
        await supabase.rpc('log_payment_security_event', {
          p_user_id: user.id,
          p_event_type: 'free_purchase_error',
          p_severity: 'high',
          p_error_message: `Failed to record free purchase: ${purchaseError.message}`,
          p_request_data: { prompt_id: promptId, price: 0 }
        });
        
        return NextResponse.json({ error: 'Failed to record free purchase' }, { status: 500 });
      }

      // Update download count
      await supabase
        .from('saved_prompts')
        .update({ downloads_count: supabase.sql`downloads_count + 1` })
        .eq('id', promptId);

      return NextResponse.json({ 
        success: true, 
        message: 'Free recipe added to your collection!',
        free: true 
      });
    }

    // Convert USD price to PromptCoins
    const promptCoinPrice = usdToPromptCoins(prompt.price);

    // Fraud detection
    const fraudCheck = detectFraudulentActivity(user.id, promptCoinPrice);
    if (fraudCheck.suspicious) {
      // Log high-severity security event for potential fraud
      await supabase.rpc('log_payment_security_event', {
        p_user_id: user.id,
        p_event_type: 'fraud_detection_triggered',
        p_severity: 'high',
        p_error_message: `Fraud detection triggered: ${fraudCheck.reason}`,
        p_request_data: { prompt_id: promptId, price: promptCoinPrice, fraud_reason: fraudCheck.reason }
      });
      
      return NextResponse.json({ 
        error: 'This transaction requires additional verification. Please contact support.' 
      }, { status: 403 });
    }

    // Purchase with PromptCoins
    const purchaseResult = await purchaseRecipeWithPromptCoins(
      user.id,
      promptId,
      promptCoinPrice,
      prompt.user_id
    );

    if (!purchaseResult.success) {
      // Log failed purchase attempt
      await supabase.rpc('log_payment_security_event', {
        p_user_id: user.id,
        p_event_type: 'promptcoin_purchase_failed',
        p_severity: 'medium',
        p_error_message: purchaseResult.error,
        p_request_data: { prompt_id: promptId, price: promptCoinPrice }
      });
      
      return NextResponse.json({ 
        error: purchaseResult.error,
        insufficientFunds: purchaseResult.error?.includes('Insufficient PromptCoins')
      }, { status: 400 });
    }

    // Track purchase velocity for fraud detection
    const now = Date.now();
    const velocityKey = `purchase_velocity_${user.id}`;
    const velocityData = rateLimitCache.get(velocityKey);
    
    if (!velocityData || now > velocityData.resetTime) {
      rateLimitCache.set(velocityKey, { count: 1, resetTime: now + 300000 }); // 5 minute window
    } else {
      velocityData.count++;
    }

    return NextResponse.json({
      success: true,
      message: `Recipe purchased successfully for ${promptCoinPrice} PromptCoins!`,
      promptCoinsUsed: promptCoinPrice,
      recipeTitle: prompt.title,
      sellerName: prompt.profiles?.full_name || 'Unknown Creator'
    });

  } catch (error) {
    console.error('Error processing PromptCoin recipe purchase:', error);
    
    // Log critical security event for unexpected errors
    try {
      await supabase.rpc('log_payment_security_event', {
        p_user_id: user.id,
        p_event_type: 'api_critical_error',
        p_severity: 'critical',
        p_error_message: error instanceof Error ? error.message : 'Unknown critical error',
        p_request_data: requestData
      });
    } catch (logError) {
      console.error('Failed to log critical security event:', logError);
    }
    
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}