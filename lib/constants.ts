import Constants from 'expo-constants';

export const APP_NAME = 'Birthminder';
export const APP_VERSION = Constants.expoConfig?.version ?? '0.0.0';
export const THEME_STORAGE_KEY = '@theme_mode';
export const ONBOARDING_COMPLETE_KEY = '@onboarding_complete';

/** App Store listing for the iOS app. */
export const APP_STORE_URL = 'https://apps.apple.com/app/birthminder/id6742752905';

/** Custom URL scheme of the iOS app (matches `expo.scheme` in app.json). */
export const APP_SCHEME = 'birthminder';

/**
 * Public URL of the web app (Vercel). Share links point here so they open
 * in any browser, and the web app offers "Open in the iOS app" on iPhones.
 * Override per environment with EXPO_PUBLIC_WEB_BASE_URL.
 */
export const WEB_BASE_URL = (
  process.env.EXPO_PUBLIC_WEB_BASE_URL ?? 'https://birthminder-deve-robert.vercel.app'
).replace(/\/+$/, '');

/**
 * The original GitHub Pages redirector. Links created before the web app
 * existed still resolve here; the page now forwards to the web app.
 */
export const LEGACY_SHARE_BASE_URL = 'https://robertop3000.github.io/Birthminder';

export function getGroupShareUrl(code: string): string {
  return `${WEB_BASE_URL}/shared/${encodeURIComponent(code)}`;
}

export function getPersonShareUrl(code: string): string {
  return `${WEB_BASE_URL}/shared/person/${encodeURIComponent(code)}`;
}

export function getGroupDeepLink(code: string): string {
  return `${APP_SCHEME}://shared/${encodeURIComponent(code)}`;
}

export function getPersonDeepLink(code: string): string {
  return `${APP_SCHEME}://shared/person/${encodeURIComponent(code)}`;
}

export const REMINDER_OPTIONS = [
  { value: 0, label: 'Same day' },
  { value: 1, label: '1 day before' },
  { value: 2, label: '2 days before' },
  { value: 3, label: '3 days before' },
  { value: 4, label: '4 days before' },
  { value: 5, label: '5 days before' },
  { value: 6, label: '6 days before' },
  { value: 7, label: '1 week before' },
] as const;
