// Shared type definitions for the entire application

// User and Authentication Types
export type UserType = 'free' | 'paid';
export type PaymentStatus = 'none' | 'active' | 'cancelled';
export type UserRole = 'user' | 'admin' | 'pro' | 'premium';

/**
 * User subscription/payment status - used for billing state
 */
export interface UserSubscriptionStatus {
  type: UserType;
  paymentStatus: PaymentStatus;
}

/** @deprecated Use UserSubscriptionStatus instead */
export type UserProfile = UserSubscriptionStatus;

/**
 * Database profile - comprehensive type for profiles table
 */
export interface DatabaseProfile {
  id: string;
  email: string;
  full_name?: string;
  first_name?: string;
  last_name?: string;
  role: UserRole;
  age?: number;
  gender?: string;
  region?: string;
  education?: string;
  payment_status?: PaymentStatus;
  subscription_tier?: 'free' | 'pro' | 'premium';
  subscription_status?: 'active' | 'cancelled' | 'expired' | 'inactive';
  subscription_start_date?: string;
  subscription_end_date?: string;
  purchased_attempts?: number;
  created_at: string;
  updated_at?: string;
}

// Prompt and Smart Prompts Types
export interface Variable {
  name: string;
  type: 'text' | 'select' | 'textarea' | 'number';
  description: string;
  required: boolean;
  options?: string[];
  defaultValue?: string;
}

export interface SmartPrompt {
  id: number;
  user_id: string;
  title: string;
  description: string;
  prompt_text: string;
  complexity_level: 'simple' | 'smart' | 'recipe';
  category: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  price: number;
  downloads_count: number;
  rating_average: number;
  rating_count: number;
  use_cases: string[];
  ai_model_compatibility: string[];
  variables: Variable[];
  example_inputs: Record<string, string>;
  is_marketplace: boolean;
  is_public: boolean;
  created_at: string;
  updated_at?: string;
  profiles?: { full_name: string };
}

// Payment Types
export interface PaymentTransaction {
  id: string;
  user_id: string;
  type: 'purchase' | 'refund' | 'usage';
  amount: number;
  description: string;
  transaction_id: string;
  payment_provider?: string;
  created_at: string;
}

// Certificate Types
export interface UserCertificate {
  id: string;
  user_id: string;
  certificate_slug: string;
  credential_id: string;
  score: number;
  expires_at: string;
  earned_at: string;
}

export interface UserCertificationStatus {
  hasValidCertificate: boolean;
  certificates: Array<Record<string, unknown>>;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Component Props Types
export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Form Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'number';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
}

// Navigation Types
export interface NavigationItem {
  name: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  description?: string;
  external?: boolean;
}

// Admin Types
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalPrompts: number;
  totalRevenue: number;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}

// Constants
export const PROMPT_COMPLEXITY_LEVELS = ['simple', 'smart', 'recipe'] as const;
export const DIFFICULTY_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;
export const PAYMENT_PROVIDERS = ['stripe', 'paypal'] as const;

export type PromptComplexity = typeof PROMPT_COMPLEXITY_LEVELS[number];
export type DifficultyLevel = typeof DIFFICULTY_LEVELS[number];
export type PaymentProvider = typeof PAYMENT_PROVIDERS[number];