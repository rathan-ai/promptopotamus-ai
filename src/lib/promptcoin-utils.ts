/**
 * PromptCoin utility functions for the PC-only economy
 * 100 PromptCoins = $1 USD conversion rate maintained for external payments
 */

/**
 * Convert USD to PromptCoins (for external payment processing)
 * @param usdAmount USD amount to convert
 * @returns PromptCoin amount (100 PC = $1 USD)
 */
export function usdToPromptCoins(usdAmount: number): number {
  return Math.round(usdAmount * 100);
}

/**
 * Convert PromptCoins to USD (for external payment processing)
 * @param pcAmount PromptCoin amount to convert
 * @returns USD amount (100 PC = $1 USD)
 */
export function promptCoinsToUsd(pcAmount: number): number {
  return pcAmount / 100;
}

/**
 * Format PromptCoin amount with proper number formatting
 * @param amount PromptCoin amount
 * @returns Formatted string with commas for thousands
 */
export function formatPromptCoins(amount: number): string {
  return amount.toLocaleString();
}

/**
 * Validate PromptCoin amount for platform limits
 * @param amount Amount to validate
 * @param min Minimum allowed amount (default: 1)
 * @param max Maximum allowed amount (default: 9999)
 * @returns Validation result
 */
export function validatePromptCoinAmount(
  amount: number, 
  min: number = 1, 
  max: number = 9999
): { valid: boolean; error?: string } {
  if (!Number.isInteger(amount)) {
    return { valid: false, error: 'PromptCoin amounts must be whole numbers' };
  }
  
  if (amount < min) {
    return { valid: false, error: `Minimum amount is ${min} PromptCoin${min === 1 ? '' : 's'}` };
  }
  
  if (amount > max) {
    return { valid: false, error: `Maximum amount is ${formatPromptCoins(max)} PromptCoins` };
  }
  
  return { valid: true };
}

/**
 * Calculate platform commission in PromptCoins
 * @param amount Total PromptCoin amount
 * @param commissionRate Commission rate (0.0 to 1.0)
 * @returns Object with commission and seller amounts
 */
export function calculatePromptCoinCommission(
  amount: number, 
  commissionRate: number
): { commission: number; sellerAmount: number } {
  const commission = Math.round(amount * commissionRate);
  const sellerAmount = amount - commission;
  
  return { commission, sellerAmount };
}

/**
 * Get PromptCoin cost for platform features
 */
export const PROMPTCOIN_COSTS = {
  analysis: 10,
  enhancement: 15,
  exam: 50,
  export: 5,
  // Minimum costs for Smart Prompts (creators can set higher)
  smart_prompt_min: 1,
  smart_prompt_max: 9999
} as const;

/**
 * Get user-friendly PromptCoin description
 * @param amount PromptCoin amount
 * @returns Descriptive string
 */
export function getPromptCoinDescription(amount: number): string {
  if (amount === 1) return '1 PromptCoin';
  if (amount < 100) return `${amount} PromptCoins`;
  if (amount < 1000) return `${amount} PromptCoins`;
  
  // For large amounts, show with commas
  return `${formatPromptCoins(amount)} PromptCoins`;
}

/**
 * Calculate total PromptCoins from user profile
 * @param profile User profile with credit balances
 * @returns Total available PromptCoins
 */
export function calculateTotalPromptCoins(profile: {
  credits_analysis?: number;
  credits_enhancement?: number;
  credits_exam?: number;
  credits_export?: number;
}): number {
  return (
    (profile.credits_analysis || 0) +
    (profile.credits_enhancement || 0) +
    (profile.credits_exam || 0) +
    (profile.credits_export || 0)
  );
}

/**
 * Check if user has sufficient PromptCoins
 * @param availableAmount Available PromptCoins
 * @param requiredAmount Required PromptCoins
 * @returns Whether user has sufficient funds
 */
export function hasSufficientPromptCoins(
  availableAmount: number, 
  requiredAmount: number
): boolean {
  return availableAmount >= requiredAmount;
}

/**
 * Get PromptCoin shortage amount
 * @param availableAmount Available PromptCoins
 * @param requiredAmount Required PromptCoins
 * @returns Shortage amount (0 if sufficient)
 */
export function getPromptCoinShortage(
  availableAmount: number, 
  requiredAmount: number
): number {
  return Math.max(0, requiredAmount - availableAmount);
}

/**
 * Suggest PromptCoin package for shortage
 * @param shortageAmount Amount needed
 * @returns Suggested USD amount to purchase
 */
export function suggestPromptCoinPackage(shortageAmount: number): number {
  // Suggest purchasing in $5 increments minimum
  const usdNeeded = promptCoinsToUsd(shortageAmount);
  if (usdNeeded <= 5) return 5;
  if (usdNeeded <= 20) return 20;
  if (usdNeeded <= 50) return 50;
  
  // Round up to nearest $10 for larger amounts
  return Math.ceil(usdNeeded / 10) * 10;
}