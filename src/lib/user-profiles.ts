'use client';

// Re-export from unified implementation for backward compatibility
export * from './user-profiles-unified';
import { clientUserProfileManager } from './user-profiles-unified';

// Export the client instance as the default
export const userProfileManager = clientUserProfileManager;