import { Platform } from 'react-native';

/**
 * Environment-specific configuration
 */

/** Origin of the running web app (e.g. https://birthminder.vercel.app), or null on native. */
export function getWebOrigin(): string | null {
  if (Platform.OS !== 'web') return null;
  const loc = (globalThis as { location?: { origin?: string } }).location;
  return loc?.origin ?? null;
}

/**
 * Recovery redirect URL for password reset emails
 * - Web: the deployed web app, which handles the recovery hash in RootLayout
 * - Dev (native): the dev build scheme
 * - Production (native): the app's bundle identifier scheme
 */
export function getRecoveryRedirectUrl(): string {
  const webOrigin = getWebOrigin();
  if (webOrigin) return `${webOrigin}/reset-password`;
  return __DEV__ ? 'birthminder://' : 'com.birthminder.app://';
}

export const RECOVERY_REDIRECT_URL = getRecoveryRedirectUrl();
