/**
 * Utility functions for data validation
 */

import { VALIDATION_RULES } from '@/lib/core/constants';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FieldValidation {
  value: unknown;
  rules: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'email' | 'password' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: unknown;
  message: string;
  validator?: (value: unknown) => boolean;
}

/**
 * Validate a single field with multiple rules
 */
export function validateField(value: unknown, rules: ValidationRule[]): ValidationResult {
  const errors: string[] = [];

  for (const rule of rules) {
    switch (rule.type) {
      case 'required':
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          errors.push(rule.message);
        }
        break;

      case 'email':
        if (value && !VALIDATION_RULES.email.pattern.test(String(value))) {
          errors.push(rule.message);
        }
        break;

      case 'password':
        if (value && !VALIDATION_RULES.password.pattern.test(String(value))) {
          errors.push(rule.message);
        }
        break;

      case 'minLength':
        if (value && String(value).length < Number(rule.value)) {
          errors.push(rule.message);
        }
        break;

      case 'maxLength':
        if (value && String(value).length > Number(rule.value)) {
          errors.push(rule.message);
        }
        break;

      case 'pattern':
        if (value && !(rule.value as RegExp).test(String(value))) {
          errors.push(rule.message);
        }
        break;

      case 'custom':
        if (rule.validator && !rule.validator(value)) {
          errors.push(rule.message);
        }
        break;
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Validate multiple fields
 */
export function validateFields(fields: Record<string, FieldValidation>): ValidationResult {
  const allErrors: string[] = [];

  for (const [fieldName, field] of Object.entries(fields)) {
    const result = validateField(field.value, field.rules);
    if (!result.isValid) {
      allErrors.push(...result.errors.map(error => `${fieldName}: ${error}`));
    }
  }

  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
}

/**
 * Email validation
 */
export function isValidEmail(email: string): boolean {
  return VALIDATION_RULES.email.pattern.test(email);
}

/**
 * Password strength validation
 */
export function isValidPassword(password: string): boolean {
  return password.length >= VALIDATION_RULES.password.minLength && 
         VALIDATION_RULES.password.pattern.test(password);
}

/**
 * URL validation
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Phone number validation (US format)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
  return phoneRegex.test(phone);
}

/**
 * Credit card validation (basic Luhn algorithm)
 */
export function isValidCreditCard(cardNumber: string): boolean {
  const cleaned = cardNumber.replace(/\s/g, '');
  
  if (!/^\d+$/.test(cleaned)) return false;
  if (cleaned.length < 13 || cleaned.length > 19) return false;

  // Luhn algorithm
  let sum = 0;
  let alternate = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned.charAt(i));
    
    if (alternate) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    alternate = !alternate;
  }
  
  return sum % 10 === 0;
}

/**
 * File type validation
 */
export function isValidFileType(file: File, allowedTypes: string[]): boolean {
  return allowedTypes.includes(file.type);
}

/**
 * File size validation
 */
export function isValidFileSize(file: File, maxSizeInBytes: number): boolean {
  return file.size <= maxSizeInBytes;
}

/**
 * JSON validation
 */
export function isValidJSON(jsonString: string): boolean {
  try {
    JSON.parse(jsonString);
    return true;
  } catch {
    return false;
  }
}

/**
 * Slug validation (for URLs)
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * Color validation (hex, rgb, hsl)
 */
export function isValidColor(color: string): boolean {
  const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  const rgbRegex = /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/;
  const hslRegex = /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/;
  
  return hexRegex.test(color) || rgbRegex.test(color) || hslRegex.test(color);
}

/**
 * Age validation
 */
export function isValidAge(birthDate: string | Date, minAge: number = 13): boolean {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 >= minAge;
  }
  
  return age >= minAge;
}

/**
 * Sanitize HTML content
 */
export function sanitizeHtml(html: string): string {
  const element = document.createElement('div');
  element.textContent = html;
  return element.innerHTML;
}

/**
 * Validate prompt content
 */
export function validatePromptContent(content: string): ValidationResult {
  const errors: string[] = [];
  
  if (!content || content.trim() === '') {
    errors.push('Prompt content is required');
  }
  
  if (content.length < 10) {
    errors.push('Prompt content must be at least 10 characters long');
  }
  
  if (content.length > 5000) {
    errors.push('Prompt content must be less than 5000 characters');
  }
  
  // Check for potential unsafe content
  const unsafePatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi
  ];
  
  for (const pattern of unsafePatterns) {
    if (pattern.test(content)) {
      errors.push('Prompt content contains potentially unsafe content');
      break;
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Common validation rule presets
 */
export const VALIDATION_PRESETS = {
  email: [
    { type: 'required', message: 'Email is required' },
    { type: 'email', message: VALIDATION_RULES.email.message }
  ] as ValidationRule[],
  
  password: [
    { type: 'required', message: 'Password is required' },
    { type: 'password', message: VALIDATION_RULES.password.message }
  ] as ValidationRule[],
  
  promptTitle: [
    { type: 'required', message: 'Title is required' },
    { type: 'minLength', value: 3, message: 'Title must be at least 3 characters' },
    { type: 'maxLength', value: 100, message: 'Title must be less than 100 characters' }
  ] as ValidationRule[],
  
  promptDescription: [
    { type: 'required', message: 'Description is required' },
    { type: 'minLength', value: 10, message: 'Description must be at least 10 characters' },
    { type: 'maxLength', value: 500, message: 'Description must be less than 500 characters' }
  ] as ValidationRule[]
};