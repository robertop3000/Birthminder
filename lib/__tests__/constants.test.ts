import { APP_NAME, APP_VERSION, THEME_STORAGE_KEY, ONBOARDING_COMPLETE_KEY } from '../constants';

describe('constants', () => {
  it('has APP_NAME defined', () => {
    expect(APP_NAME).toBe('BirthdayCalendar');
  });

  it('has APP_VERSION defined', () => {
    expect(APP_VERSION).toBeDefined();
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('has THEME_STORAGE_KEY defined', () => {
    expect(THEME_STORAGE_KEY).toBeDefined();
    expect(typeof THEME_STORAGE_KEY).toBe('string');
  });

  it('has ONBOARDING_COMPLETE_KEY defined', () => {
    expect(ONBOARDING_COMPLETE_KEY).toBeDefined();
    expect(typeof ONBOARDING_COMPLETE_KEY).toBe('string');
  });
});
