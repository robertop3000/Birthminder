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

      if (permissionStatus !== 'granted') return;

      for (const person of birthdays) {
        // Schedule birthday-day notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Happy Birthday ${person.name}! 🎂`,
            body: `Today is ${person.name}'s birthday!`,
            data: { personId: person.id },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
            month: person.birthday_month,
            day: person.birthday_day,
            hour: 9,
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

          await Notifications.scheduleNotificationAsync({
            content: {
              title: `Birthday Reminder 🔔`,
              body: `${person.name}'s birthday is in ${daysBefore} day${daysBefore > 1 ? 's' : ''}!`,
              data: { personId: person.id },
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
              month: reminderDate.getMonth() + 1,
              day: reminderDate.getDate(),
              hour: 9,
              minute: 0,
              repeats: true,
            },
          });
        }
      }
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
