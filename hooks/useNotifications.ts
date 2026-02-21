import { useState, useEffect, useCallback } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { getNextBirthday } from '../lib/dateHelpers';
import { subDays } from 'date-fns';
import { Person } from './useBirthdays';

export function useNotifications() {
  const { user } = useAuth();
  const [permissionStatus, setPermissionStatus] = useState<string | null>(null);
  const [daysBefore, setDaysBefore] = useState(0);

  useEffect(() => {
    checkPermission();
    loadPreference();
  }, [user]);

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

  const loadPreference = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('notification_days_before')
      .eq('id', user.id)
      .single();

    if (data?.notification_days_before != null) {
      setDaysBefore(data.notification_days_before);
    }
  }, [user]);

  const updatePreference = useCallback(
    async (days: number) => {
      if (!user) return;
      await supabase
        .from('profiles')
        .update({ notification_days_before: days })
        .eq('id', user.id);
      setDaysBefore(days);
    },
    [user]
  );

  const scheduleAllNotifications = useCallback(
    async (birthdays: Person[]) => {
      await Notifications.cancelAllScheduledNotificationsAsync();

      if (permissionStatus !== 'granted') {
        console.warn(`[Notifications] Skipping scheduling: permission is ${permissionStatus}`);
        return;
      }

      for (const person of birthdays) {
        // Schedule birthday-day notification
        const birthdayIdentifier = person.id;
        await Notifications.scheduleNotificationAsync({
          identifier: birthdayIdentifier,
          content: {
            title: `Happy Birthday ${person.name}! 🎂`,
            body: `Today is ${person.name}'s birthday!`,
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

        // Schedule advance reminder
        if (daysBefore > 0) {
          const nextBday = getNextBirthday(
            person.birthday_month,
            person.birthday_day
          );
          const reminderDate = subDays(nextBday, daysBefore);
          const reminderIdentifier = `${person.id}-reminder`;

          await Notifications.scheduleNotificationAsync({
            identifier: reminderIdentifier,
            content: {
              title: `Birthday Reminder 🔔`,
              body: `${person.name}'s birthday is in ${daysBefore} day${daysBefore > 1 ? 's' : ''}!`,
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
      }

      console.log(`[Notifications] Successfully scheduled ${birthdays.length} birthday alerts (at 8:00 AM)`);
    },
    [permissionStatus, daysBefore]
  );

  return {
    permissionStatus,
    daysBefore,
    requestPermission,
    updatePreference,
    scheduleAllNotifications,
  };
}
