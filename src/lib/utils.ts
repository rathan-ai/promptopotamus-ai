import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind CSS class utility for combining classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export commonly used utilities for backward compatibility
export {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  truncateText,
  slugify,
  capitalize,
  generateId,
  debounce,
  throttle
} from './utils/formatting';