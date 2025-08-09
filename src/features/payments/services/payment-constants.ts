// Pricing constants in USD - shared between client and server
export const FEATURE_PRICING = {
  PROMPT_ANALYSIS: 0.50,      // $0.50 per analysis
  PROMPT_ENHANCEMENT: 1.00,    // $1.00 per enhancement
  EXAM_ATTEMPT: 5.00,          // $5.00 per exam attempt
  EXPORT_FEATURE: 0.25,        // $0.25 per export
  MIN_SMART_PROMPT_PRICE: 0.99, // Minimum price for Smart Prompts
} as const;