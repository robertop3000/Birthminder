import {
  WEB_BASE_URL,
  getGroupShareUrl,
  getPersonShareUrl,
  getGroupDeepLink,
  getPersonDeepLink,
} from '../constants';
import { getSafeNextPath } from '../navigation';

describe('share links', () => {
  it('has an https web base URL without a trailing slash', () => {
    expect(WEB_BASE_URL).toMatch(/^https:\/\//);
    expect(WEB_BASE_URL.endsWith('/')).toBe(false);
  });

  it('builds group and person share URLs on the web app', () => {
    expect(getGroupShareUrl('abc123')).toBe(`${WEB_BASE_URL}/shared/abc123`);
    expect(getPersonShareUrl('xyz789')).toBe(`${WEB_BASE_URL}/shared/person/xyz789`);
  });

  it('URL-encodes share codes', () => {
    expect(getGroupShareUrl('a b/c')).toBe(`${WEB_BASE_URL}/shared/a%20b%2Fc`);
  });

  it('builds iOS deep links with the app scheme', () => {
    expect(getGroupDeepLink('abc123')).toBe('birthminder://shared/abc123');
    expect(getPersonDeepLink('xyz789')).toBe('birthminder://shared/person/xyz789');
  });
});

describe('getSafeNextPath', () => {
  it('falls back to the tabs route when no next is given', () => {
    expect(getSafeNextPath(undefined)).toBe('/(tabs)');
    expect(getSafeNextPath('')).toBe('/(tabs)');
  });

  it('accepts relative in-app paths', () => {
    expect(getSafeNextPath('/shared/abc123')).toBe('/shared/abc123');
    expect(getSafeNextPath(['/shared/person/x'])).toBe('/shared/person/x');
  });

  it('rejects absolute and protocol-relative URLs', () => {
    expect(getSafeNextPath('https://evil.example')).toBe('/(tabs)');
    expect(getSafeNextPath('//evil.example')).toBe('/(tabs)');
    expect(getSafeNextPath('/x?u=https://evil.example')).toBe('/(tabs)');
    expect(getSafeNextPath('javascript:alert(1)')).toBe('/(tabs)');
  });

  it('honours a custom fallback', () => {
    expect(getSafeNextPath(undefined, '/(auth)/login')).toBe('/(auth)/login');
  });
});
