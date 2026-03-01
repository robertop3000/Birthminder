import { useState, useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { subDays } from 'date-fns';
import { Person } from './useBirthdays';
import { getNextBirthday } from '../lib/dateHelpers';

export function useNotifications() {
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = useCallback(async () => {
    const { status } = await Notifications.getPermissionsAsync();

    if (status === 'undetermined') {
      const granted = await requestPermission();
      if (!granted) {
        console.warn('[Notifications] Permission denied after request');
      }
    } else if (status === 'denied') {
      console.warn('[Notifications] Permission is currently denied. Users must enable it in system settings.');
    }

    setPermissionStatus(status);
  }, []);

  const requestPermission = useCallback(async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    setPermissionStatus(status);
    return status === 'granted';
  }, []);

  const scheduleAllNotifications = useCallback(
    async (birthdays: Person[]) => {
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (permissionStatus === null) return;

      if (permissionStatus !== 'granted') {
        console.warn(`[Notifications] Skipping scheduling: permission is ${permissionStatus}`);
        return;
      }

      let totalScheduled = 0;

      for (const person of birthdays) {
        const days = person.reminder_days ?? [0];

        for (const daysBefore of days) {
          if (daysBefore === 0) {
            // Same-day notification
            await Notifications.scheduleNotificationAsync({
              identifier: `${person.id}-0`,
              content: {
                title: `Happy Birthday ${person.name}! 🎂`,
                body: `Today is ${person.name}'s birthday!`,
                sound: 'default',
                data: { personId: person.id },
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
                month: person.birthday_month,
                day: person.birthday_day,
                hour: 8,
                minute: 0,
                repeats: true,
              },
            });
          } else {
            // Advance reminder
            const nextBday = getNextBirthday(person.birthday_month, person.birthday_day);
            const reminderDate = subDays(nextBday, daysBefore);

            await Notifications.scheduleNotificationAsync({
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
                repeats: true,
              },
            });
          }
          totalScheduled++;
        }
      }

      console.log(`[Notifications] Successfully scheduled ${totalScheduled} notifications for ${birthdays.length} birthdays (at 8:00 AM)`);
    },
    [permissionStatus]
  );

  return {
    permissionStatus,
    requestPermission,
    scheduleAllNotifications,
  };
}
