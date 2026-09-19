import { useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { subDays } from 'date-fns';
import { Person } from './useBirthdays';
import { Group } from '../contexts/GroupsContext';
import { getNextBirthday } from '../lib/dateHelpers';
import { getEffectiveReminders } from '../lib/reminderHelpers';

const IS_WEB = Platform.OS === 'web';

/**
 * Maps the browser Notification permission to the expo-notifications vocabulary.
 * `unsupported` is reported when the browser has no Notification API at all
 * (e.g. iOS Safari outside of an installed PWA).
 */
export function getWebNotificationPermission(): string {
  if (typeof globalThis === 'undefined') return 'unsupported';
  const NotificationApi = (globalThis as { Notification?: { permission: string } }).Notification;
  if (!NotificationApi) return 'unsupported';
  switch (NotificationApi.permission) {
    case 'granted':
      return 'granted';
    case 'denied':
      return 'denied';
    default:
      return 'undetermined';
  }
}

/**
 * Local birthday reminders.
 *
 * On iOS the reminders are scheduled on-device with expo-notifications.
 * On web, local scheduling is unavailable; reminders are delivered by the
 * server through Web Push instead (see `hooks/useWebPush.ts`), so the
 * scheduling functions are no-ops there and only the permission state is
 * tracked.
 */
export function useNotifications() {
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);

  useEffect(() => {
    checkPermission();
  }, []);

  const requestPermission = useCallback(async () => {
    if (IS_WEB) {
      const NotificationApi = (globalThis as { Notification?: { requestPermission: () => Promise<string> } }).Notification;
      if (!NotificationApi) {
        setPermissionStatus('unsupported');
        return false;
      }
      await NotificationApi.requestPermission();
      const status = getWebNotificationPermission();
      setPermissionStatus(status);
      return status === 'granted';
    }

    const { status } = await Notifications.requestPermissionsAsync();
    setPermissionStatus(status);
    return status === 'granted';
  }, []);

  const checkPermission = useCallback(async () => {
    if (IS_WEB) {
      // Never prompt automatically on web; the user opts in from Settings.
      setPermissionStatus(getWebNotificationPermission());
      return;
    }

    const { status } = await Notifications.getPermissionsAsync();

    if (status === 'undetermined') {
      const granted = await requestPermission();
      if (!granted) {
        if (__DEV__) console.warn('[Notifications] Permission denied after request');
      }
    } else if (status === 'denied') {
      if (__DEV__) console.warn('[Notifications] Permission is currently denied. Users must enable it in system settings.');
    }

    setPermissionStatus(status);
  }, [requestPermission]);

  const cancelNotificationsForPerson = useCallback(async (personId: string) => {
    if (IS_WEB) return;
    // Cancel all possible notification identifiers for this person (0-7 days)
    const ALL_POSSIBLE_DAYS = [0, 1, 2, 3, 4, 5, 6, 7];
    const cancelPromises = ALL_POSSIBLE_DAYS.map((daysBefore: number) =>
      Notifications.cancelScheduledNotificationAsync(`${personId}-${daysBefore}`)
    );
    await Promise.all(cancelPromises);
  }, []);

  const scheduleAllNotifications = useCallback(
    async (birthdays: Person[], groups: Group[] = []) => {
      if (IS_WEB) return; // Delivered by Web Push from the server instead.

      await Notifications.cancelAllScheduledNotificationsAsync();

      if (permissionStatus === null) return;

      if (permissionStatus !== 'granted') {
        if (__DEV__) console.warn(`[Notifications] Skipping scheduling: permission is ${permissionStatus}`);
        return;
      }

      // Build all scheduling promises
      const schedulingPromises: Promise<string>[] = [];

      for (const person of birthdays) {
        const { effectiveDays } = getEffectiveReminders(person, groups);
        const days = effectiveDays.length > 0 ? effectiveDays : [0];

        for (const daysBefore of days) {
          if (daysBefore === 0) {
            // Same-day notification — use getNextBirthday to handle Feb 29 in leap years
            const nextBday = getNextBirthday(person.birthday_month, person.birthday_day);
            schedulingPromises.push(
              Notifications.scheduleNotificationAsync({
                identifier: `${person.id}-0`,
                content: {
                  title: `Happy Birthday ${person.name}! 🎂`,
                  body: `Today is ${person.name}'s birthday!`,
                  sound: 'default',
                  data: { personId: person.id },
                },
                trigger: {
                  type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                  month: nextBday.getMonth() + 1,
                  day: nextBday.getDate(),
                  hour: 8,
                  minute: 0,
                  repeats: false,
                },
              })
            );
          } else {
            // Advance reminder
            const nextBday = getNextBirthday(person.birthday_month, person.birthday_day);
            const reminderDate = subDays(nextBday, daysBefore);

            schedulingPromises.push(
              Notifications.scheduleNotificationAsync({
                identifier: `${person.id}-${daysBefore}`,
                content: {
                  title: `Birthday Reminder 🔔`,
                  body: `${person.name}'s birthday is in ${daysBefore} day${daysBefore > 1 ? 's' : ''}!`,
                  sound: 'default',
                  data: { personId: person.id },
                },
                trigger: {
                  type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                  month: reminderDate.getMonth() + 1,
                  day: reminderDate.getDate(),
                  hour: 8,
                  minute: 0,
                  repeats: false,
                },
              })
            );
          }
        }
      }

      // Process in chunks of 50 to avoid blocking the JS thread
      const CHUNK_SIZE = 50;
      let totalScheduled = 0;

      for (let i = 0; i < schedulingPromises.length; i += CHUNK_SIZE) {
        const chunk = schedulingPromises.slice(i, i + CHUNK_SIZE);
        await Promise.all(chunk);
        totalScheduled += chunk.length;
      }

      if (__DEV__) console.log(`[Notifications] Scheduled ${totalScheduled} notifications for ${birthdays.length} birthdays`);
    },
    [permissionStatus]
  );

  return {
    permissionStatus,
    requestPermission,
    scheduleAllNotifications,
    cancelNotificationsForPerson,
  };
}
