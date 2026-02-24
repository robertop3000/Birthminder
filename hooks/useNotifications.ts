import { useState, useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { Person } from './useBirthdays';

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

      for (const person of birthdays) {
        await Notifications.scheduleNotificationAsync({
          identifier: person.id,
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
      }

      console.log(`[Notifications] Successfully scheduled ${birthdays.length} birthday alerts (at 8:00 AM)`);
    },
    [permissionStatus]
  );

  return {
    permissionStatus,
    requestPermission,
    scheduleAllNotifications,
  };
}
