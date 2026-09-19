import { Platform } from 'react-native';
import { getWebNotificationPermission } from '../useNotifications';

const platform = Platform as { OS: string };

describe('getWebNotificationPermission', () => {
  const originalOS = platform.OS;
  const originalNotification = (globalThis as { Notification?: unknown }).Notification;

  afterEach(() => {
    platform.OS = originalOS;
    Object.defineProperty(globalThis, 'Notification', {
      value: originalNotification,
      configurable: true,
      writable: true,
    });
  });

  function setPermission(permission: string | null) {
    Object.defineProperty(globalThis, 'Notification', {
      value: permission === null ? undefined : { permission },
      configurable: true,
      writable: true,
    });
  }

  it('reports unsupported when the browser has no Notification API', () => {
    setPermission(null);
    expect(getWebNotificationPermission()).toBe('unsupported');
  });

  it('maps granted and denied directly', () => {
    setPermission('granted');
    expect(getWebNotificationPermission()).toBe('granted');
    setPermission('denied');
    expect(getWebNotificationPermission()).toBe('denied');
  });

  it('maps the browser default state to undetermined', () => {
    setPermission('default');
    expect(getWebNotificationPermission()).toBe('undetermined');
  });
});
