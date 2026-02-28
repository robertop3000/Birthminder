/**
 * Environment-specific configuration
 */

/**
 * Recovery redirect URL for password reset emails
 * - Dev: Uses the dev build scheme
 * - Production: Uses the app's bundle identifier scheme
 */
export const RECOVERY_REDIRECT_URL = __DEV__
  ? 'birthminder://'
  : 'com.birthminder.app://';
