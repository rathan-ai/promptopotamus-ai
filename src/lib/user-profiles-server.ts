// Re-export from unified implementation for backward compatibility
export * from './user-profiles-unified';
import { serverUserProfileManager } from './user-profiles-unified';

// Export the server instance as the default
export { serverUserProfileManager };