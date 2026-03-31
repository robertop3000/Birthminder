import Constants from 'expo-constants';

export const APP_NAME = 'Birthminder';
export const APP_VERSION = Constants.expoConfig?.version ?? '0.0.0';
export const THEME_STORAGE_KEY = '@theme_mode';
export const ONBOARDING_COMPLETE_KEY = '@onboarding_complete';
export const SHARE_BASE_URL = 'https://robertop3000.github.io/Birthminder';

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
